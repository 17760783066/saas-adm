import React, { Component } from 'react';
import { Card, Table, Dropdown, Menu, Tabs } from 'antd';
import { App, CTYPE, U, Utils } from '../../common';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { DownOutlined, ExclamationCircleOutlined, FileAddOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;

class Trade extends Component {
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
            list: [],
            tradeQo: {},
            categories: [],

        }
    }
    componentDidMount() {
        this.loadData();
    }
    loadData = () => {
        let { pagination, tradeQo = {}, type } = this.state;
        tradeQo["type"] = type;
        this.setState({ loading: true });
        App.api('merchant/trade/trades', {
            tradeQo: JSON.stringify({
                ...tradeQo,
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
    render() {
        let { loading, selectedRowKeys = [], list = [], categories = [] } = this.state;
        return (
            <div>
                <BreadcrumbCustom first={CTYPE.link.trade.txt} />
                <Card title={
                    <Tabs defaultActiveKey="0" onChange={(key) =>
                        this.setState({ type: key }, this.loadData)
                    }>
                        <TabPane tab="全部" key="0" />
                        <TabPane tab="待付款" key="1" />
                        <TabPane tab="已付款" key="2" />
                        <TabPane tab="已发货" key="3" />
                        <TabPane tab="交易已完成" key="4" />
                        <TabPane tab="交易已关闭" key="5" />
                    </Tabs>
                }>
                    <Table
                        columns={[{
                            title: '序号',
                            dataIndex: 'id',
                            align: 'center',
                            width: '80px',
                            render: (col, row, i) => i + 1
                        }, {
                            title: '订单编号',
                            dataIndex: 'orderNumber',
                            align: 'center',

                        }, {
                            title: '优惠后价格',
                            dataIndex: 'totalAmount',
                            align: 'center',
                        }, {
                            title: '总价',
                            dataIndex: 'totalPrice',
                            align: 'center',
                        }, {
                            title: '产品编号',
                            dataIndex: 'tradeItems',
                            align: 'center',
                            render: (tradeItems = []) => {
                                let productSno = tradeItems.length > 0 ? tradeItems[0].productSno : [];
                                return <div>
                                    {productSno}
                                </div>
                            }
                        }, {
                            title: '用户名',
                            dataIndex: 'address',
                            align: 'center',
                            render: (address = {}) => {
                                let { name } = address;
                                return <div>
                                    {name}
                                </div>
                            }
                        }, {
                            title: '用户号码',
                            dataIndex: 'address',
                            align: 'center',
                            render: (address = {}) => {
                                let { mobile } = address;
                                return <div>
                                    {mobile}
                                </div>
                            }
                        },
                        {
                            title: '用户地址',
                            dataIndex: 'address',
                            align: 'center',
                            render: (address = {}) => {
                                let { location = {} } = address;
                                let { poiaddress, poiname } = location;
                                return <div>
                                    {poiaddress + poiname}
                                </div>
                            }
                        }, {

                            title: '创建时间',
                            dataIndex: 'createdAt',
                            align: 'center',
                            width: '160px',
                            render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'
                        },
                        {
                            title: '状态',
                            dataIndex: 'type',
                            align: 'center',
                            render: (type) => Utils.getType(type).tag
                        }, {
                            title: '操作',
                            dataIndex: 'option',
                            align: 'center',
                            width: '100px',
                            render: (obj, product, index) => {
                                let { status, id, } = product;
                                return <Dropdown overlay={<Menu>
                                    <Menu.Divider />
                                </Menu>} trigger={['click']}>
                                    <a className="ant-dropdown-link">
                                        操作 <DownOutlined />
                                    </a>
                                </Dropdown>
                            }

                        }]}
                        rowKey={(item) => item.id}
                        dataSource={list}
                        pagination={true}
                        loading={loading}
                    />
                </Card>
            </div>
        );
    }
}

export default Trade;