// Data received from /v2/pages/
module.exports.fetchContents = {
    data: [
        {
            id: 3,
            channel_id: 1,
            name: 'Blog',
            is_visible: true,
            parent_id: 0,
            sort_order: 4,
            type: 'blog_index',
            is_homepage: false,
            is_customers_only: false
        },
        {
            id: 4,
            channel_id: 1,
            name: 'Contact Us',
            meta_title: '',
            email: '',
            body: "<p>We're happy to answer questions or help you with returns.<br />Please fill out the form below if you need assistance.</p>",
            is_visible: true,
            parent_id: 0,
            sort_order: 3,
            meta_keywords: '',
            type: 'contact_form',
            contact_fields: 'fullname,companyname,phone,orderno,rma',
            meta_description: '',
            is_homepage: false,
            layout_file: 'page.html',
            is_customers_only: false,
            search_keywords: '',
            has_mobile_version: false,
            mobile_body: '0',
            url: '/contact-us/'
        }
    ]
};
