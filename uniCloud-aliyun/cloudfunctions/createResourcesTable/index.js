'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
    try {
        // 检查表是否存在
        const tables = await db.getTables();
        if (tables.indexOf('resources') !== -1) {
            return {
                code: 201,
                message: '表已存在，无需创建'
            };
        }

        // 创建表
        await db.createCollection('resources');

        // 创建索引
        await db.collection('resources').createIndex({
            resourceType: 1 // 创建resourceType字段的索引，1表示升序
        });

        await db.collection('resources').createIndex({
            types: 1 // 创建types字段的索引
        });

        await db.collection('resources').createIndex({
            title: "text" // 创建title字段的全文索引，用于搜索
        });

        await db.collection('resources').createIndex({
            createTime: -1 // 创建createTime字段的降序索引，用于按时间排序
        });

        // 添加示例数据
        await db.collection('resources').add([
            {
                resourceType: 'tv',
                types: ['urban', 'romance'],
                title: '示例电视剧',
                description: '这是一个示例电视剧描述',
                link: 'https://example.com/tv1',
                cover: 'https://example.com/cover1.jpg',
                createTime: Date.now(),
                updateTime: Date.now()
            },
            {
                resourceType: 'movie',
                types: ['comedy', 'action'],
                title: '示例电影',
                description: '这是一个示例电影描述',
                link: 'https://example.com/movie1',
                cover: 'https://example.com/cover2.jpg',
                createTime: Date.now(),
                updateTime: Date.now()
            }
        ]);

        return {
            code: 200,
            message: '表创建成功'
        };
    } catch (error) {
        return {
            code: 500,
            message: error.message
        };
    }
}; 