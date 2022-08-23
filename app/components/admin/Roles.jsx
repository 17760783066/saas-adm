import { DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Menu, message, Modal, Table, Tag } from 'antd';
import React from 'react';
import { App, CTYPE, U } from "../../common";
import BreadcrumbCustom from '../BreadcrumbCustom';
export default class Roles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,

            list: []

        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        this.setState({ loading: true });
        App.api('merchant/adm/roles',{
            merchantRoleQo:JSON.stringify({

            })
        }).then((roles) => {
            this.setState({
                list: roles,
                loading: false
            });
        });
    };

    edit = group => {
        App.go(`/app/admin/role-edit/${group.id}`)
    };

    remove = (id, index) => {
        Modal.confirm({
            title: `确认删除操作?`,
            onOk: () => {
                App.api('adm/admin/remove_role', { id }).then(() => {
                    message.success('删除成功');
                    let list = this.state.list;
                    this.setState({
                        list: U.array.remove(list, index)
                    })
                })
            },
        });
    };

    render() {

        let { list = [], loading } = this.state;

        return <div className="common-list">

            <BreadcrumbCustom first={CTYPE.link.admin_roles.txt} />

            <Card title={<Button icon={<PlusCircleOutlined />} type={'primary'} onClick={() => {
                this.edit({ id: 0 })
            }}>添加</Button>}>
                <Table
                    columns={[{
                        title: '序号',
                        dataIndex: 'id',
                        align: 'center',
                        width: '60px',
                        render: (col, row, i) => i + 1
                    }, {
                        title: '名称',
                        dataIndex: 'name',
                        align: 'center',
                        width: '120px',
                    }, {
                        title: '权限',
                        dataIndex: 'pstr',
                        align: 'center',
                        render: (pstr = []) => {
                            return <div className='status'>
                                {pstr.map((p, i) => {
                                    return <Tag color={p.level} key={i}>{p.label}</Tag>
                                })}
                            </div>
                        }
                    }, {
                        title: '操作',
                        dataIndex: 'opt',
                        align: 'center',
                        width: '80px',
                        render: (obj, role, index) => {
                            return <Dropdown overlay={<Menu>
                                <Menu.Item key="1">
                                    <a onClick={() => this.edit(role)}>编辑</a>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="2">
                                    <a onClick={() => this.remove(role.id, index)}>删除</a>
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
                    loading={loading} />
            </Card>
        </div>
    }
}
