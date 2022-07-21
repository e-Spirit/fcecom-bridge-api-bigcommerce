// Data received from /v3/catalog/products
module.exports.fetchProducts = {
    data: [
        {
            id: 86,
            name: 'Able Brewing System',
            sku: 'ABS',
            primary_image: {
                id: 286,
                product_id: 86,
                is_thumbnail: true,
                sort_order: 0,
                description: '',
                image_file: '%%SAMPLE%%/stencil/ablebrewingsystem4.jpg',
                url_zoom:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/86/images/286/ablebrewingsystem4.1591339048.1280.1280.jpg?c=1',
                url_standard:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/86/images/286/ablebrewingsystem4.1591339048.386.513.jpg?c=1',
                url_thumbnail:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/86/images/286/ablebrewingsystem4.1591339048.220.290.jpg?c=1',
                url_tiny: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/86/images/286/ablebrewingsystem4.1591339048.44.58.jpg?c=1',
                date_modified: '2020-06-05T06:37:28+00:00'
            }
        },
        {
            id: 88,
            name: 'Chemex Coffeemaker 3 Cup',
            sku: 'CC3C',
            primary_image: {
                id: 292,
                product_id: 88,
                is_thumbnail: true,
                sort_order: 0,
                description: '',
                image_file: '%%SAMPLE%%/stencil/3cupchemex5.jpg',
                url_zoom: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/88/images/292/3cupchemex5.1591339048.1280.1280.jpg?c=1',
                url_standard: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/88/images/292/3cupchemex5.1591339048.386.513.jpg?c=1',
                url_thumbnail: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/88/images/292/3cupchemex5.1591339048.220.290.jpg?c=1',
                url_tiny: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/88/images/292/3cupchemex5.1591339048.44.58.jpg?c=1',
                date_modified: '2020-06-05T06:37:28+00:00'
            }
        },
        {
            id: 93,
            name: '1 L Le Parfait Jar',
            sku: 'SLLPJ',
            primary_image: {
                id: 311,
                product_id: 93,
                is_thumbnail: true,
                sort_order: 2,
                description: '',
                image_file: '%%SAMPLE%%/stencil/leparfaitmedium3.jpg',
                url_zoom: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/93/images/311/leparfaitmedium3.1591339048.1280.1280.jpg?c=1',
                url_standard:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/93/images/311/leparfaitmedium3.1591339048.386.513.jpg?c=1',
                url_thumbnail:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/93/images/311/leparfaitmedium3.1591339048.220.290.jpg?c=1',
                url_tiny: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/93/images/311/leparfaitmedium3.1591339048.44.58.jpg?c=1',
                date_modified: '2020-06-05T06:37:28+00:00'
            }
        },
        {
            id: 94,
            name: 'Oak Cheese Grater',
            sku: 'OCG',
            primary_image: {
                id: 314,
                product_id: 94,
                is_thumbnail: true,
                sort_order: 0,
                description: '',
                image_file: '%%SAMPLE%%/stencil/oakcheesegrater2.jpg',
                url_zoom: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/94/images/314/oakcheesegrater2.1591339048.1280.1280.jpg?c=1',
                url_standard:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/94/images/314/oakcheesegrater2.1591339048.386.513.jpg?c=1',
                url_thumbnail:
                    'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/94/images/314/oakcheesegrater2.1591339048.220.290.jpg?c=1',
                url_tiny: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/94/images/314/oakcheesegrater2.1591339048.44.58.jpg?c=1',
                date_modified: '2020-06-05T06:37:28+00:00'
            }
        },
        {
            id: 97,
            name: 'Tiered Wire Basket',
            sku: 'TWB',
            primary_image: {
                id: 325,
                product_id: 97,
                is_thumbnail: true,
                sort_order: 0,
                description: '',
                image_file: '%%SAMPLE%%/stencil/tieredbasket.jpg',
                url_zoom: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/97/images/325/tieredbasket.1591339048.1280.1280.jpg?c=1',
                url_standard: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/97/images/325/tieredbasket.1591339048.386.513.jpg?c=1',
                url_thumbnail: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/97/images/325/tieredbasket.1591339048.220.290.jpg?c=1',
                url_tiny: 'https://cdn11.bigcommerce.com/s-kedbzcz8vy/products/97/images/325/tieredbasket.1591339048.44.58.jpg?c=1',
                date_modified: '2020-06-05T06:37:28+00:00'
            }
        }
    ],
    meta: {
        pagination: {
            total: 5,
            count: 5,
            per_page: 50,
            current_page: 1,
            total_pages: 1,
            links: {
                current: '?page=1&include_fields=name%2Csku&include=primary_image&categories%3Ain=21&limit=50'
            },
            too_many: false
        }
    }
};

// Data received from /v3/catalog/products/86
module.exports.getProductUrl = {
    data: {
        id: 86,
        custom_url: { url: '/able-brewing-system/', is_customized: false }
    },
    meta: {}
};
