module.exports.categoriesGet = {
    data: [
        {
            id: 18,
            parent_id: 0,
            name: 'Bath',
            sort_order: 1,
            custom_url: { url: '/bath/', is_customized: false }
        },
        {
            id: 19,
            parent_id: 18,
            name: 'Garden',
            sort_order: 2,
            custom_url: { url: '/bath/garden/', is_customized: false }
        },
        {
            id: 20,
            parent_id: 0,
            name: 'Publications',
            sort_order: 4,
            custom_url: { url: '/publications/', is_customized: false }
        },
        {
            id: 21,
            parent_id: 18,
            name: 'Kitchen',
            sort_order: 3,
            custom_url: { url: '/bath/kitchen/', is_customized: false }
        },
        {
            id: 22,
            parent_id: 21,
            name: 'Utility',
            sort_order: 5,
            custom_url: { url: '/bath/kitchen/utility/', is_customized: false }
        },
        {
            id: 23,
            parent_id: 0,
            name: 'Shop All',
            sort_order: 0,
            custom_url: { url: '/shop-all/', is_customized: false }
        }
    ],
    meta: {
        pagination: {}
    }
};
