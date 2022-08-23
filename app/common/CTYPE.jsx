let CTYPE = (() => {

    let maxlength = { title: 40, intro: 500, descr: 140 };
    let minlength = { title: 1, intro: 1 };
    let eidtMaxWidth = 1800;
    let eidtMinWidth = 900;
    let formStyle = { minWidth: eidtMinWidth, maxWidth: eidtMaxWidth, marginTop: '20px' };

    return {

        minprice: 0,
        maxprice: 1000000,

        eidtMaxWidth: 1800,

        eidtMinWidth: 900,

        maxVisitNum: 9999999,

        maxlength: maxlength,

        minlength: minlength,
        pagination: { pageSize: 20 },

        formStyle,

        commonPagination: { showQuickJumper: true, showSizeChanger: true, showTotal: total => `总共 ${total} 条` },

        fieldDecorator_rule_title: {
            type: 'string',
            required: true,
            message: `标题长度为${minlength.title}~${maxlength.title}个字`,
            whitespace: true,
            min: minlength.title,
            max: maxlength.title
        },

        link: {
            admin_admins: { key: '/app/admin/admins', path: '/app/admin/admins', txt: '管理员' },
            admin_roles: { key: '/app/admin/roles', path: '/app/admin/roles', txt: '权限组' },
            merchant_list:{key:'/app/merchant/list',path:'/app/merchant/list',txt:'商户列表'},
            renews:{key:'/app/finance/renews',path:'/app/renew/renews',txt:'账单'},
            product_templates:{key:'/app/product/product-templates',path:'/app/product/product-templates',txt:'我的模板'},
            products:{key:'/app/product/products',path:'/app/product/products',txt:'我的产品'},
            trade:{key:'/app/trade/trades',path:'/app/trade/trades',txt:'订单'},
        },

        //图片裁切工具比例
        imgeditorscale: {
            square: 1,
            rectangle_v: 1.7778,
            rectangle_h: 0.5625,
            rectangle_ad: 0.29,
            rectangle_cover: 0.75
        },

        formItemLayout: {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        },
        dialogItemLayout: {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        },
        shortFormItemLayout: {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 }
            },
            wrapperCol: {
                xs: { span: 4 },
                sm: { span: 3 }
            }
        },
        longFormItemLayout: {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        },
        tailFormItemLayout: {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0
                },
                sm: {
                    span: 16,
                    offset: 3
                }
            }
        },

        fileTypes: [{
            key: 'image',
            suffixs: ['jpg', 'jpeg', 'png']
        }, {
            key: 'word',
            suffixs: ['doc', 'docx']
        }, {
            key: 'pdf',
            suffixs: ['pdf']
        }, {
            key: 'excel',
            suffixs: ['xls', 'xlsx']
        }, {
            key: 'ppt',
            suffixs: ['ppt', 'pptx']
        }],

        REGION_PATH: window.location.protocol + '//c1.wakkaa.com/assets/pca-code.json',
        qqmapKey: 'KDKBZ-6FIRW-C27R6-RZ57X-BA4R2-U4F3W'

    };

})();

export default CTYPE;
