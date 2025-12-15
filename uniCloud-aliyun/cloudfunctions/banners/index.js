'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
    const { action, data, userInfo } = event

    // 校验权限（仅管理员可添加/修改/删除）
    if (['add', 'update', 'remove'].includes(action)) {
        if (!userInfo || userInfo.role !== 'admin') {
            return {
                code: 403,
                msg: '权限不足'
            };
        }
    }

    switch (action) {
        case 'add':
            return await addBanner(data)
        case 'remove':
            return await removeBanner(data)
        case 'update':
            return await updateBanner(data)
        case 'list':
            return await getBannerList()
        default:
            return {
                code: 404,
                msg: '未找到对应的操作'
            }
    }
}

// 添加轮播图
async function addBanner(data) {
    const { imageUrl, link } = data

    await db.collection('banners').add({
        imageUrl,
        link,
        createTime: Date.now()
    })

    return {
        code: 200,
        msg: '添加成功'
    }
}

// 删除轮播图
async function removeBanner(data) {
    const { _id } = data

    // 获取轮播图信息
    const banner = await db.collection('banners').doc(_id).get()

    // 删除云存储中的图片
    await uniCloud.deleteFile({
        fileList: [banner.data[0].imageUrl]
    })

    // 删除数据库记录
    await db.collection('banners').doc(_id).remove()

    return {
        code: 200,
        msg: '删除成功'
    }
}

// 更新轮播图
async function updateBanner(data) {
    const { _id, link } = data

    await db.collection('banners').doc(_id).update({
        link
    })

    return {
        code: 200,
        msg: '更新成功'
    }
}

// 获取轮播图列表
async function getBannerList() {
    const banners = await db.collection('banners')
        .orderBy('createTime', 'desc')
        .get()

    return {
        code: 200,
        data: banners.data
    }
} 