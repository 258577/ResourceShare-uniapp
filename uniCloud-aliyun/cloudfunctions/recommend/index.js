// 推荐资源管理云函数
'use strict';

const db = uniCloud.database();
const resourcesCollection = db.collection('resources');
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
    const { action, data, userInfo } = event;

    // 默认返回对象
    let response = {
        code: 200,
        msg: 'success',
        data: null
    };

    // 验证管理员权限（所有修改操作都需要管理员权限）
    if (['toggleRecommend', 'setRecommend', 'batchRecommend', 'cancelAllRecommend'].includes(action)) {
        if (!userInfo || userInfo.role !== 'admin') {
            // 直接返回权限错误，不包装在result中
            return {
                code: 403,
                msg: '无权限操作',
                data: null
            };
        }
    }

    // 根据action分发不同的处理逻辑
    switch (action) {
        case 'toggleRecommend':
            response = await handleToggleRecommend(data, userInfo);
            break;
        case 'setRecommend':
            response = await handleSetRecommend(data, userInfo);
            break;
        case 'getRecommended':
            response = await handleGetRecommended(data);
            break;
        case 'batchRecommend':
            response = await handleBatchRecommend(data, userInfo);
            break;
        case 'cancelAllRecommend':
            response = await handleCancelAllRecommend(data, userInfo);
            break;
        case 'checkRecommendStatus':
            response = await handleCheckRecommendStatus(data);
            break;
        default:
            response = {
                code: 400,
                msg: '未知操作',
                data: null
            };
    }

    // 直接返回响应对象，不包装在result中
    return response;
};

// 切换推荐状态（推荐/取消推荐）
async function handleToggleRecommend(data, userInfo) {
    const { id, recommend } = data;

    if (!id) {
        return {
            code: 400,
            msg: '缺少资源ID',
            data: null
        };
    }

    try {
        console.log('处理推荐状态变更:', id, recommend);
        const db = uniCloud.database();
        const recommendCollection = db.collection('recommend');

        // 1. 先更新资源表中的推荐状态
        const updateResult = await resourcesCollection.doc(id).update({
            recommended: !!recommend,
            updatedAt: new Date().getTime()
        });

        if (!updateResult.updated) {
            return {
                code: 404,
                msg: '资源不存在',
                data: null
            };
        }

        // 2. 根据推荐状态操作recommend表
        if (recommend) {
            // 先检查是否已经存在推荐记录，防止重复添加
            const existingRecord = await recommendCollection.where({
                resource_id: id
            }).get();

            if (existingRecord.data && existingRecord.data.length > 0) {
                // 如果已存在记录，先删除旧记录
                console.log('已存在推荐记录，更新推荐时间');
                await recommendCollection.where({
                    resource_id: id
                }).remove();
            }

            // 添加到recommend表
            await recommendCollection.add({
                resource_id: id,
                recommended_at: new Date().getTime(),
                create_date: new Date()
            });
            console.log('资源已添加到recommend表:', id);
        } else {
            // 从recommend表中删除所有相关记录，确保没有重复推荐项
            const deleteResult = await recommendCollection.where({
                resource_id: id
            }).remove();
            console.log(`资源已从recommend表中移除，影响记录: ${deleteResult.deleted || 0}条`, id);
        }

        return {
            code: 200,
            msg: recommend ? '推荐成功' : '取消推荐成功',
            data: null
        };
    } catch (e) {
        console.error('推荐操作失败:', e);
        return {
            code: 500,
            msg: '操作失败',
            data: null
        };
    }
}

// 设置推荐状态（与toggleRecommend逻辑类似，保留API兼容性）
async function handleSetRecommend(data, userInfo) {
    const { _id, recommended } = data;

    // 转换参数格式，调用toggleRecommend
    return await handleToggleRecommend({
        id: _id,
        recommend: recommended
    }, userInfo);
}

// 获取推荐资源
async function handleGetRecommended(data) {
    const { limit = 10 } = data;

    try {
        console.log('云函数recommend: 开始获取推荐资源, limit =', limit);

        // 直接从数据库获取推荐资源ID列表
        const db = uniCloud.database();
        const recommendCollection = db.collection('recommend');

        // 1. 先获取最新的推荐记录
        const recommendRecords = await recommendCollection
            .limit(Number(limit))
            .orderBy('recommended_at', 'desc')
            .get();

        // 如果没有推荐记录，直接返回空数组
        if (!recommendRecords.data || recommendRecords.data.length === 0) {
            console.log('云函数recommend: 没有推荐记录');
            return {
                code: 200,
                msg: 'success',
                data: []
            };
        }

        // 2. 提取资源ID列表
        const resourceIds = recommendRecords.data.map(item => item.resource_id);
        console.log('云函数recommend: 找到推荐资源ID:', resourceIds);

        // 3. 通过ID列表一次性获取资源详情
        const resources = await db.collection('resources')
            .where({
                _id: db.command.in(resourceIds)
            })
            .get();

        // 如果没有找到资源，返回空数组
        if (!resources.data || resources.data.length === 0) {
            console.log('云函数recommend: 未找到对应的资源记录');
            return {
                code: 200,
                msg: 'success',
                data: []
            };
        }

        // 4. 创建ID到推荐时间的映射，用于排序
        const idToRecommendTimeMap = {};
        recommendRecords.data.forEach(item => {
            idToRecommendTimeMap[item.resource_id] = item.recommended_at;
        });

        // 5. 合并资源数据和推荐时间
        const resultResources = resources.data.map(item => {
            return {
                ...item,
                recommended: true,
                recommended_at: idToRecommendTimeMap[item._id]
            };
        });

        // 6. 按推荐时间排序
        resultResources.sort((a, b) => b.recommended_at - a.recommended_at);

        console.log(`云函数recommend: 获取推荐资源成功, 数量: ${resultResources.length}`);

        return {
            code: 200,
            msg: 'success',
            data: resultResources
        };
    } catch (e) {
        console.error('云函数recommend: 获取推荐资源失败:', e);
        return {
            code: 500,
            msg: '获取推荐资源失败',
            data: []
        };
    }
}

// 批量推荐资源
async function handleBatchRecommend(data, userInfo) {
    const { ids } = data;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
            code: 400,
            msg: '请提供要推荐的资源ID列表',
            data: null
        };
    }

    try {
        const db = uniCloud.database();
        const recommendCollection = db.collection('recommend');
        const now = new Date().getTime();

        // 1. 批量更新resources表中的推荐状态
        const promises = ids.map(id =>
            resourcesCollection.doc(id).update({
                recommended: true,
                updatedAt: now
            })
        );

        await Promise.all(promises);

        // 2. 批量处理recommend表记录
        // 先清理已存在的记录，确保没有重复数据
        console.log('清理现有的recommend记录，资源ID:', ids);
        await recommendCollection.where({
            resource_id: db.command.in(ids)
        }).remove();

        // 3. 重新添加推荐记录
        const addRecords = ids.map(id => ({
            resource_id: id,
            recommended_at: now,
            create_date: new Date()
        }));

        if (addRecords.length > 0) {
            await recommendCollection.add(addRecords);
            console.log(`已将${ids.length}个资源添加到recommend表`);
        }

        return {
            code: 200,
            msg: `已成功推荐${ids.length}个资源`,
            data: null
        };
    } catch (e) {
        console.error('批量推荐失败:', e);
        return {
            code: 500,
            msg: '批量推荐失败',
            data: null
        };
    }
}

// 取消所有推荐
async function handleCancelAllRecommend(data, userInfo) {
    try {
        const db = uniCloud.database();
        const recommendCollection = db.collection('recommend');

        // 1. 先获取所有推荐资源ID
        const recommendRecords = await recommendCollection.field('resource_id').get();

        if (!recommendRecords.data || recommendRecords.data.length === 0) {
            return {
                code: 200,
                msg: '当前没有推荐的资源',
                data: null
            };
        }

        // 提取不重复的资源ID
        const resourceIds = [...new Set(recommendRecords.data.map(item => item.resource_id))];
        console.log(`找到${resourceIds.length}个不同的推荐资源ID`);

        // 2. 批量取消resources表中的推荐状态
        const now = new Date().getTime();
        const promises = resourceIds.map(id =>
            resourcesCollection.doc(id).update({
                recommended: false,
                updatedAt: now
            })
        );

        await Promise.all(promises);

        // 3. 清空recommend表
        const deleteResult = await recommendCollection.where({}).remove();
        console.log(`已清空recommend表，删除了${deleteResult.deleted || 0}条记录`);

        return {
            code: 200,
            msg: `已取消所有资源(${resourceIds.length}个)的推荐`,
            data: null
        };
    } catch (e) {
        console.error('取消所有推荐失败:', e);
        return {
            code: 500,
            msg: '取消所有推荐失败',
            data: null
        };
    }
}

// 检查资源推荐状态
async function handleCheckRecommendStatus(data) {
    const { id } = data;

    if (!id) {
        return {
            code: 400,
            msg: '缺少资源ID',
            data: null
        };
    }

    try {
        const resource = await resourcesCollection.doc(id).get();

        if (!resource.data || resource.data.length === 0) {
            return {
                code: 404,
                msg: '资源不存在',
                data: null
            };
        }

        return {
            code: 200,
            msg: 'success',
            data: {
                isRecommended: !!resource.data[0].recommended
            }
        };
    } catch (e) {
        console.error('检查推荐状态失败:', e);
        return {
            code: 500,
            msg: '检查推荐状态失败',
            data: null
        };
    }
} 