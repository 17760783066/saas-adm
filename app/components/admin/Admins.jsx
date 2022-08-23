import { DownOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Dropdown, Menu, message, Modal, Table, Tag } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { App, CTYPE, U, Utils } from "../../common";
import BreadcrumbCustom from '../BreadcrumbCustom';
import AdminProfile from "./AdminProfile";
import AdminUtils from "./AdminUtils";

@inject('admin')
@observer
class Admins extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loading: false
        }
    }

    componentDidMount() {
        AdminProfile.get().then(profile => {
            this.props.admin.setProfile(profile);
        });
        this.loadData();
    }

    loadData = () => {
        this.setState({ loading: true });
        App.api('merchant/adm/merchantAdmins',{
            merchantAdminQo: JSON.stringify({
                
            })

        }).then((merchantAdmins) => {
            this.setState({
                list: merchantAdmins,
                loading: false
            });
        });

    };

    edit = merchantAdmins => {
        App.go(`/app/admin/admin-edit/${merchantAdmins.id}`)
    };

    remove = (id, index) => {
        Modal.confirm({
            title: `确认删除操作?`,
            onOk: () => {
                App.api('adm/admin/remove_admin', { id }).then(() => {
                    message.success('删除成功');
                    let list = this.state.list;
                    this.setState({
                        list: U.array.remove(list, index)
                    })
                })
            },
            onCancel() {
            },
        });
    };

    status = (id, status) => {
        Modal.confirm({
            title: '提示',
            content: `确定${status == 1 ? '停用' : '启用'}操作吗?`,
            onOk: () => App.api('adm/admin/admin_status', { id, status: status == 1 ? 2 : 1 }).then(this.loadData)
        });
    };

    render() {

        let { list = [], loading } = this.state;

        return <div className="common-list">

         <BreadcrumbCustom first={CTYPE.link.admin_admins.txt} /> 

            <Card title={<Button type="primary" icon={<UserAddOutlined />} onClick={() => {
                this.edit({ id: 0 })
            }}>管理员</Button>}>
                <Table
                    columns={[{
                        title: '序号',
                        dataIndex: 'id',
                        align: 'center',
                        width: '80px',
                        render: (col, row, i) => i + 1
                    }, {
                        title: '头像',
                        dataIndex: 'img',
                        align: 'center',
                        width: '100px',
                        render: img =>  <Avatar shape="square" src={img} size={40} icon={<UserOutlined />} />
                    }, {
                        title: '名称',
                        dataIndex: 'name',
                        align: 'center',
                    }, {
                        title: '手机号',
                        dataIndex: 'mobile',
                        align: 'center',
                    }, {
                        title: '管理组',
                        dataIndex: ['merchantRole', 'name'],
                        align: 'center',
                        render: (str) => <Tag color='blue'>{str}</Tag>
                    }, {
                        title: '创建时间',
                        dataIndex: 'createdAt',
                        align: 'center',
                        width: '120px',
                        render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd') : '-/-'
                    }, {
                        title: '最近登录',
                        dataIndex: 'signinAt',
                        align: 'center',
                        width: '160px',
                        render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'
                    }, {
                        title: '状态',
                        dataIndex: 'status',
                        align: 'center',
                        width: '60px',
                        render: (status) => Utils.getStatus(status).tag
                    }, {
                        title: '操作',
                        dataIndex: 'option',
                        align: 'center',
                        width: '100px',
                        render: (obj, admin, index) => {
                            let { id, status } = admin;
                            return <Dropdown overlay={<Menu>
                                <Menu.Item key="1">
                                    <a onClick={() => this.edit(admin)}>编辑</a>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="2">
                                    <a onClick={() => this.remove(admin.id, index)}>删除</a>
                                </Menu.Item>
                                <Menu.Item key="3">
                                    <a onClick={() => this.status(id, status)}>{status == 1 ? '停用' : '启用'}</a>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="4">
                                    <a onClick={() => AdminUtils.adminSessions(admin.id, admin.name)}>登录日志</a>
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

export default Admins;
