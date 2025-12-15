'use strict';
const db = uniCloud.database();
const resourceCollection = db.collection('resources');

exports.main = async (event, context) => {
    console.log('resources云函数收到请求: ', event);

    const { action, data } = event;

    // 校验权限（仅管理员可添加/修改/删除）
    if (['add', 'update', 'remove'].includes(action)) {
        const { userInfo } = event;
        if (!userInfo || userInfo.role !== 'admin') {
            return {
                code: 403,
                msg: '权限不足'
            };
        }
    }

    // 根据不同操作执行不同逻辑
    switch (action) {
        case 'add':
            return await addResource(data);
        case 'list':
            return await getResourceList(data);
        case 'detail':
            return await getResourceDetail(data);
        case 'update':
            return await updateResource(data);
        case 'remove':
            return await removeResource(data);
        case 'incrementView':
            return await incrementViewCount(data);
        case 'search':
            return await searchResources(data);
        case 'getRecommended':
            return await getRecommended(data);
        default:
            return {
                code: 404,
                msg: '未知操作'
            };
    }
};

// 添加资源
async function addResource(data) {
    const {
        resourceType,
        types,
        title,
        description,
        link,
        cover,
        recommended = false
    } = data;

    if (!resourceType || !title || !description || !link || !cover) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    try {
        const result = await resourceCollection.add({
            resourceType,
            types: types || [],
            title,
            description,
            link,
            cover,
            recommended: !!recommended,
            favoriteCount: 0,
            viewCount: 0,
            createTime: Date.now(),
            updateTime: Date.now()
        });

        return {
            code: 200,
            msg: '添加成功',
            data: result
        };
    } catch (e) {
        return {
            code: 500,
            msg: e.message || '添加失败'
        };
    }
}

// 获取资源列表
async function getResourceList(data) {
    const { resourceType, type, keyword, page = 1, pageSize = 20, recommended } = data || {};

    try {
        const dbCmd = db.command;
        let query = resourceCollection;
        const queryCondition = {};

        // 按资源类型筛选
        if (resourceType) {
            queryCondition.resourceType = resourceType;
        }

        // 按子类型筛选
        if (type) {
            queryCondition.types = dbCmd.all([type]);
        }

        // 按关键词搜索
        if (keyword) {
            queryCondition.title = new RegExp(keyword, 'i');
        }

        // 按是否推荐筛选
        if (recommended) {
            queryCondition.recommended = true;
        }

        if (Object.keys(queryCondition).length > 0) {
            query = query.where(queryCondition);
        }

        // 获取总数
        const total = await query.count();

        // 分页查询
        const resources = await query
            .orderBy('createTime', 'desc')
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .get();

        return {
            code: 200,
            msg: '查询成功',
            data: {
                list: resources.data,
                total: total.total,
                page,
                pageSize
            }
        };
    } catch (e) {
        return {
            code: 500,
            msg: e.message || '查询失败'
        };
    }
}

// 获取资源详情
async function getResourceDetail(data) {
    const { id } = data;

    if (!id) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    try {
        const result = await resourceCollection.doc(id).get();

        if (result.data && result.data.length > 0) {
            return {
                code: 200,
                msg: '查询成功',
                data: result.data[0]
            };
        } else {
            return {
                code: 404,
                msg: '资源不存在'
            };
        }
    } catch (e) {
        return {
            code: 500,
            msg: e.message || '查询失败'
        };
    }
}

// 更新资源
async function updateResource(data) {
    const { _id, ...updateData } = data;

    if (!_id) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    try {
        const result = await resourceCollection.doc(_id).update({
            ...updateData,
            updateTime: Date.now()
        });

        return {
            code: 200,
            msg: '更新成功',
            data: result
        };
    } catch (e) {
        return {
            code: 500,
            msg: e.message || '更新失败'
        };
    }
}

// 删除资源
async function removeResource(data) {
    const { _id } = data;

    if (!_id) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    try {
        console.log(`开始删除资源 ${_id} 及相关联数据`);

        // 获取资源信息，用于删除云存储中的图片
        const resource = await resourceCollection.doc(_id).get();
        if (resource.data && resource.data.length > 0) {
            const cover = resource.data[0].cover;

            // 删除云存储中的图片
            try {
                await uniCloud.deleteFile({
                    fileList: [cover]
                });
                console.log(`成功删除资源 ${_id} 的封面图片`);
            } catch (e) {
                console.error(`删除资源 ${_id} 的云存储图片失败:`, e);
                // 继续执行删除记录的操作
            }
        }

        // 创建数据库操作的事务
        const db = uniCloud.database();

        // 删除关联记录
        try {
            console.log(`开始删除资源 ${_id} 的收藏记录`);
            await db.collection('favorites')
                .where({
                    resourceId: _id
                })
                .remove();
            console.log(`成功删除资源 ${_id} 的收藏记录`);
        } catch (e) {
            console.error(`删除资源 ${_id} 的收藏记录失败:`, e);
            // 继续执行其他操作
        }

        // 删除推荐记录
        try {
            console.log(`开始删除资源 ${_id} 的推荐记录`);
            await db.collection('recommend')
                .where({
                    resource_id: _id
                })
                .remove();
            console.log(`成功删除资源 ${_id} 的推荐记录`);
        } catch (e) {
            console.error(`删除资源 ${_id} 的推荐记录失败:`, e);
            // 继续执行其他操作
        }

        // 最后删除资源本身
        await resourceCollection.doc(_id).remove();
        console.log(`成功删除资源 ${_id}`);

        return {
            code: 200,
            msg: '删除成功'
        };
    } catch (e) {
        console.error(`删除资源 ${_id} 发生错误:`, e);
        return {
            code: 500,
            msg: e.message || '删除失败'
        };
    }
}

// 增加浏览计数
async function incrementViewCount(data) {
    const { id } = data;

    if (!id) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    try {
        await resourceCollection.doc(id).update({
            viewCount: db.command.inc(1)
        });

        return {
            code: 200,
            msg: '更新成功'
        };
    } catch (e) {
        return {
            code: 500,
            msg: e.message || '更新失败'
        };
    }
}

// 搜索资源
async function searchResources(data) {
    const { keyword, page = 1, pageSize = 20 } = data;

    if (!keyword) {
        return {
            code: 400,
            msg: '搜索关键词不能为空'
        };
    }

    try {
        const dbCmd = db.command;
        // 使用正则表达式在标题和描述中搜索关键词
        const query = resourceCollection.where(dbCmd.or([
            {
                title: new RegExp(keyword, 'i')
            },
            {
                description: new RegExp(keyword, 'i')
            }
        ]));

        // 获取结果
        const result = await query
            .orderBy('createTime', 'desc')
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .get();

        return {
            code: 200,
            msg: '搜索成功',
            data: result.data
        };
    } catch (e) {
        return {
            code: 500,
            msg: e.message || '搜索失败'
        };
    }
}

/**
 * 获取推荐资源列表
 * @deprecated 此函数已迁移到recommend云函数，保留此函数仅为兼容性考虑
 * @param {Object} data - 请求参数
 * @param {number} [data.limit=6] - 获取数量
 * @returns {Promise<Object>} - 推荐资源列表
 */
async function getRecommended(data) {
    console.log('警告: resources.getRecommended函数已废弃，请直接调用recommend云函数');
    const limit = data?.limit || 6;

    try {
        // 简化实现，直接从resources表获取推荐资源
        const collection = db.collection('resources');
        const result = await collection
            .where({
                recommended: true
            })
            .limit(limit)
            .orderBy('updateTime', 'desc')
            .get();

        console.log(`resources.getRecommended兼容函数: 直接从resources表获取了${result.data.length}条推荐资源`);

        return {
            code: 200,
            msg: '获取成功',
            data: result.data
        };
    } catch (error) {
        console.error('resources.getRecommended异常:', error);
        return {
            code: 500,
            msg: '服务器异常',
            data: []
        };
    }
} 