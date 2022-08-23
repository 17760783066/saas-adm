import { FileJpgOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Select } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { App, CTYPE, OSSWrap, U } from "../../common";
import BreadcrumbCustom from '../BreadcrumbCustom';
import AdminProfile from "./AdminProfile";

const Option = Select.Option;
const FormItem = Form.Item;

export default class AdminEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: parseInt(this.props.match.params.id),

            merchantAdmin: {},

            roles: [],
            loading: false
        }
    }

    componentDidMount() {
        App.api('merchant/adm/roles',{
            merchantRoleQo:JSON.stringify({

            })
        }).then((roles) => {
            if (roles.length === 0) {
                message.warn('请先设置管理组');
            } else {
                this.setState({ roles });
                let { id } = this.state;
                if (id !== 0) {
                    App.api('merchant/adm/merchantAdmin', { id }).then((merchantAdmin) => {
                        this.setState({ merchantAdmin });
                    })
                }
            }
        });
    }

    handleSubmit = () => {

        let { merchantAdmin = {}, id } = this.state;

        let { mobile, name, roleId, password } = merchantAdmin;
        if (!U.str.MobileLength(mobile)) {
            return message.warning("请填写正确的手机号")
        }
        if (!U.str.isChinaMobile(mobile)) {
            message.warn('请填写正确的手机号');
            return;
        }
        if (U.str.isEmpty(name)) {
            message.warn('请输入名称');
            return
        }
        if (id === 0 && U.str.isEmpty(password)) {
            message.warn("长度6-18，只能包含小写英文字母、数字、下划线，且以字母开头");
            return;
        }
        if (roleId === 0) {
            message.warn('请选择管理组');
            return;
        }
        this.setState({ loading: true });
        App.api('merchant/adm/save_merchantAdmin', { 'merchantAdmin': JSON.stringify(merchantAdmin) }).then(() => {
            AdminProfile.clear();
            this.setState({ loading: false });
            window.history.back();
        }, () => this.setState({ loading: false }));
    };

    handleNewImage = e => {

        let { uploading = false, merchantAdmin } = this.state;

        let img = e.target.files[0];

        if (!e.target.files[0] || !(e.target.files[0].type.indexOf('jpg') > 0 || e.target.files[0].type.indexOf('png') > 0 || e.target.files[0].type.indexOf('jpeg') > 0)) {
            message.error('文件类型不正确,请选择图片类型');
            this.setState({
                uploading: false
            });
            return;
        }
        if (uploading) {
            message.loading('上传中');
            return;
        }
        this.setState({ uploading: true });
        OSSWrap.upload(img).then((result) => {
            this.setState({
                merchantAdmin: {
                    ...merchantAdmin,
                    img: result.url,
                },
                uploading: false
            });

        }).catch((err) => {
            message.error(err);
        });
    };

    render() {

        let { merchantAdmin = {}, roles = [], id, loading } = this.state;
        let { mobile, name, password, roleId = 0, img } = merchantAdmin;

        return <div className="common-edit-page">

            <Card
                title={<BreadcrumbCustom
                    first={<Link to={CTYPE.link.admin_admins.path}>{CTYPE.link.admin_admins.txt}</Link>}
                    second='编辑管理员' />}
                extra={<Button type="primary" icon={<SaveOutlined />} loading={loading}
                    onClick={() => {
                        this.handleSubmit()
                    }}
                    htmlType="submit">提交</Button>}
                style={CTYPE.formStyle}>

                <FormItem {...CTYPE.formItemLayout} required={true} label="名称">
                    <Input value={name} placeholder="请输入名称,最多十个字" maxLength={10} style={{ width: '300px' }}
                        onChange={(e) => {
                            this.setState({
                                merchantAdmin: {
                                    ...merchantAdmin,
                                    name: e.target.value
                                }
                            })
                        }} />
                </FormItem>
                <FormItem required={true} {...CTYPE.formItemLayout} label="手机号">
                    <Input value={mobile} maxLength={11} placeholder="请输入手机号" disabled={id !== 0}
                        style={{ width: '300px' }}
                        onChange={(e) => {
                            this.setState({
                                merchantAdmin: {
                                    ...merchantAdmin,
                                    mobile: e.target.value
                                }
                            })
                        }} />
                </FormItem>

                <FormItem required={true} {...CTYPE.formItemLayout} label="密码">
                    <Input value={password} placeholder="请输入密码" style={{ width: '300px' }} onChange={(e) => {
                        this.setState({
                            merchantAdmin: {
                                ...merchantAdmin,
                                password: e.target.value
                            }
                        })
                    }} />
                </FormItem>

                <FormItem required={true} {...CTYPE.formItemLayout} label="管理组">
                    <Select
                        style={{ width: '300px' }}
                        value={roleId.toString()}
                        onChange={(roleId) => {
                            this.setState({
                                merchantAdmin: {
                                    ...merchantAdmin,
                                    roleId: parseInt(roleId)
                                }
                            })
                        }}>
                        <Option value='0' key={-1}>请选择</Option>
                        {roles.map((g, i) => {
                            return <Option key={i} value={g.id}>{g.name}</Option>
                        })}
                    </Select>
                </FormItem>
                <FormItem
                    {...CTYPE.formItemLayout}
                    label="上传头像">
                    <div className="common-edit-page">
                        <div className='upload-img-preview' style={{ width: '100px', height: '100px' }}>
                            {img && <img src={img} style={{ width: '100px', height: '100px' }} />}
                        </div>
                        <div className='upload-img-tip'>
                            <Button type="primary" icon={<FileJpgOutlined />}>
                                <input className="file" type='file' onChange={this.handleNewImage} />
                                选择图片</Button>
                        </div>
                    </div>
                </FormItem>
            </Card>
        </div>
    }

}

