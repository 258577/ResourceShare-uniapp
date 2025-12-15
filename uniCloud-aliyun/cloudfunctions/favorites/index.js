'use strict';

const db = uniCloud.database();
const favoriteCollection = db.collection('favorites');
const resourceCollection = db.collection('resources');

exports.main = async (event, context) => {
    const { action, data } = event;

    switch (action) {
        case 'add':
            return await addFavorite(data);
        case 'remove':
            return await removeFavorite(data);
        case 'list':
            return await listFavorites(data);
        case 'check':
            return await checkFavorite(data);
        default:
            return {
                code: 400,
                message: '未知操作'
            };
    }
};

// 添加收藏
async function addFavorite(data) {
    const { userId, resourceId, title, description, cover, link } = data;

    if (!userId || !resourceId) {
        return {
            code: 400,
            message: '参数不完整'
        };
    }

    try {
        // 检查是否已收藏
        const existing = await favoriteCollection.where({
            userId,
            resourceId
        }).get();

        if (existing.data.length > 0) {
            return {
                code: 200,
                message: '已经收藏过了',
                data: true
            };
        }

        // 添加收藏记录
        await favoriteCollection.add({
            userId,
            resourceId,
            title,
            description,
            cover,
            link,
            createTime: new Date()
        });

        // 更新资源的收藏计数
        await resourceCollection.doc(resourceId).update({
            favoriteCount: db.command.inc(1)
        });

        return {
            code: 200,
            message: '收藏成功',
            data: true
        };
    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

// 取消收藏
async function removeFavorite(data) {
    const { _id, userId, resourceId } = data;

    try {
        let query = {};

        // 支持通过收藏ID删除或通过用户ID和资源ID删除
        if (_id) {
            query = { _id };
        } else if (userId && resourceId) {
            query = { userId, resourceId };
        } else {
            return {
                code: 400,
                message: '参数错误'
            };
        }

        // 查询要删除的记录，获取resourceId
        const favoriteRecord = await favoriteCollection.where(query).get();

        if (favoriteRecord.data.length === 0) {
            return {
                code: 404,
                message: '收藏记录不存在'
            };
        }

        const targetResourceId = favoriteRecord.data[0].resourceId;

        // 删除收藏记录
        await favoriteCollection.where(query).remove();

        // 更新资源的收藏计数
        await resourceCollection.doc(targetResourceId).update({
            favoriteCount: db.command.inc(-1)
        });

        return {
            code: 200,
            message: '取消收藏成功',
            data: false
        };
    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

// 获取用户收藏列表
async function listFavorites(data) {
    const { userId, page = 1, pageSize = 10 } = data;

    if (!userId) {
        return {
            code: 400,
            message: '用户ID不能为空'
        };
    }

    try {
        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 查询收藏记录
        const result = await favoriteCollection
            .where({ userId })
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get();

        return {
            code: 200,
            message: '获取成功',
            data: result.data
        };
    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

// 检查是否已收藏
async function checkFavorite(data) {
    const { userId, resourceId } = data;

    if (!userId || !resourceId) {
        return {
            code: 400,
            message: '参数不完整'
        };
    }

    try {
        const result = await favoriteCollection.where({
            userId,
            resourceId
        }).get();

        return {
            code: 200,
            message: '查询成功',
            data: result.data.length > 0
        };
    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}