import { Card, Col, Dropdown, Menu, Modal, Row, Table, TreeSelect } from 'antd';
import React, { Component } from 'react';
import { DownOutlined, ExclamationCircleOutlined } from '_@ant-design_icons@4.7.0@@ant-design/icons';
import Search from '_antd@4.19.2@antd/lib/transfer/search';
import { App, CTYPE, U, Utils } from '../../common';
import BreadcrumbCustom from '../BreadcrumbCustom';
import ProductUtils from './ProductUtils';

export default class ProductTemplates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagination: {
                pageSize: CTYPE.pagination.pageSize,
                current: 0,
                total: 0,
                selectedRowKeys: [],
                loading: false,
            },
            productQo: {},
            list: [],
            categories: [],

        }
    }
    componentDidMount() {
        this.loadData();
        App.api('merchant/product/categories').then((categories) => {
            this.setState({
                categories
            })
        });
    }

    loadData = () => {
        let { pagination, productQo = {} } = this.state;
        this.setState({ loading: true });
        App.api('merchant/product/templates', {
            productQo: JSON.stringify({
                ...productQo,
                pageNumber: pagination.current,
                pageSize: pagination.pageSize
            })
        }).then((ret) => {
            let pagination = Utils.pager.convert2Pagination(ret);
            let { content = [] } = ret;
            this.setState({
                list: content,
                pagination,
                loading: false
            });
        });

    };
    start = () => {
        let { selectedRowKeys = [] } = this.state;
        this.setState({
            selectedRowKeys: [],
        });
        var ids = selectedRowKeys;
        App.api('merchant/product/product_templates_remove', {
            ids: JSON.stringify(ids)
        }).then(() => {
            this.loadData();
        })

    };

    edit = productTemplate => {

        App.go(`/app/product/product-edit/${productTemplate.id}/0`)
    }
    status = (id, status) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            title: `确认${status == 1 ? '封禁' : '启用'}操作`,
            onOk: () => {
                App.api(`merchant/product/product_template_status`, { id, status: status == 1 ? 2 : 1 }).then(() => { this.loadData() })
            },
            onCancel() {
            },
        })
    }
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };
    reloadDate = (key, value) => {
        let { pagination = {}, productQo = {} } = this.state;
        if (key) {
            productQo[key] = value;
        }
        this.setState(
            {
                productQo,
                pagination: {
                    ...pagination,
                    current: 1,
                },
            },
            () => {
                this.loadData();
            }
        );
    };


    confirm = () => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            title: '确认批量删除操作',
            onOk: () => { this.start },
            onCancel() {
            },
        })
    }
    render() {
        let { loading, list = [], categories = [] } = this.state;

        return (
            <div>
                <BreadcrumbCustom first={CTYPE.link.product_templates.txt} />

                <Card>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={10} ></Col>
                        <Col span={14}>
                            <Search
                                style={{ float: 'right', marginRight: '10px' }}
                                placeholder="输入名称查询"
                                onSearch={(val) => {
                                    this.reloadDate('name', val);
                                }
                                }
                            />
                            <TreeSelect
                                treeData={categories}
                                showSearch
                                style={{ width: '50%' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeNodeFilterProp="label"
                                placeholder="请选择分类"
                                allowClear
                                treeDefaultExpandAll
                                treeCheckable
                                multiple
                                fieldNames={{ label: 'name', key: 'sequence', value: 'id' }}
                                onChange={(value) => {
                                    this.reloadDate('mixtureCategoryId', value);
                                }}
                            />
                        </Col>
                    </Row>


                    <Table
                        columns={[{
                            title: '序号',
                            dataIndex: 'id',
                            align: 'center',
                            width: '80px',
                            render: (col, row, i) => i + 1
                        }, {
                            title: '名称',
                            dataIndex: 'name',
                            align: 'center',

                        }, {
                            title: '类别',
                            dataIndex: 'categoryId',
                            align: 'center',
                            render: (categoryId) => ProductUtils.renderCateTags(categoryId, categories)

                        }, {
                            title: '图片',
                            dataIndex: 'specs',
                            align: 'center',
                            render: (specs = []) => {
                                let imgs = specs.length > 0 ? specs[0].imgs : [];
                                return <img style={{ width: 60, height: 60 }} src={imgs[0]}
                                    onClick={() => {
                                        Utils.common.showImgLightbox(imgs)
                                    }} />
                            }
                        }, {
                            title: '规格',
                            dataIndex: 'specs',
                            align: 'center',
                            render: (specs = [], productTemplate) => {
                                return <a onClick={() => { ProductUtils.templateDrawer(productTemplate.id) }}>【{specs.length}】</a>
                            }
                        }, {
                            title: '参数',
                            dataIndex: 'params',
                            align: 'center',
                            render: (params = [], productTemplate) => {
                                return <a onClick={() => { ProductUtils.templateDrawer(productTemplate.id) }}>【{params.length}】</a>
                            }
                        }, {

                            title: '创建时间',
                            dataIndex: 'createdAt',
                            align: 'center',
                            width: '160px',
                            render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'

                        }, {
                            title: '操作',
                            dataIndex: 'option',
                            align: 'center',
                            width: '100px',
                            render: (obj, productTemplate, index) => {
                                let { status, id, } = productTemplate;
                                return <Dropdown overlay={<Menu>
                                    <Menu.Item key="1">
                                        <a onClick={() => this.edit(productTemplate)}>编辑</a>
                                    </Menu.Item>
                                </Menu>} trigger={['click']}>
                                    <a className="ant-dropdown-link">
                                        操作 <DownOutlined />
                                    </a>
                                </Dropdown>
                            }

                        }]}
                        rowKey={(item) => item.id}
                        dataSource={list}
                        pagination={false}
                        loading={loading}
                    />
                </Card>

            </div>
        );
    }
}