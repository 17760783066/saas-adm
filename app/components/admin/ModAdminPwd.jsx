import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Form, Input, message, Modal, notification } from 'antd';
import React from 'react';
import '../../assets/css/common/common-list.scss';
import { App, CTYPE, U, Utils } from '../../common';

const FormItem = Form.Item;
const id_div = 'div-dialog-mod-pwd';

export default class ModAdminPwd extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            flag: true
        };
        this.formRef = React.createRef();
    }

    updatePassword = () => {
        let fromItem = this.formRef.current.getFieldsValue();

        let { oldPassword, password, repeatPassword } = fromItem;

        if (U.str.isEmpty(oldPassword)) {
            return message.warning("请输入当前密码");
        }
        if (!U.str.isPassWord(password)) {
            return message.warning('长度6-18，只能包含小写英文字母、数字、下划线，且以字母开头');
        }
        if (!U.str.isPassWord(repeatPassword)) {
            return message.warning('长度6-18，只能包含小写英文字母、数字、下划线，且以字母开头');
        }
        if (password !== repeatPassword) {
            return message.warn("请检查输入的新密码是否一致");

        }
        this.setState({ loading: true });
        App.api('adm/admin/update_password', {
            password: password,
            repeatPassword: repeatPassword,
            oldPassword: oldPassword
        }).then(res => {
            this.setState({ loading: false });
            this.close();
            notification.success({ message: "修改密码", description: "操作成功,请重新登录" });
            App.logout();
            App.go("/login");
        }, () => this.setState({ loading: false }))
    };

    close = () => {
        Utils.common.closeModalContainer(id_div)
    };

    render() {

        let { flag } = this.state;

        return <Modal title={'修改密码'}
            getContainer={() => Utils.common.createModalContainer(id_div)}
            visible={true}
            width={'600px'}
            confirmLoading={this.state.loading}
            onOk={this.updatePassword}
            onCancel={this.close}>
            <Form ref={this.formRef}>

                <FormItem name="oldPassword" rules={[{
                    type: 'string',
                    required: true,
                    message: '请输入当前密码',
                    whitespace: true
                }]}
                    {...CTYPE.dialogItemLayout}
                    label={(
                        <span>当前密码</span>
                    )}
                    hasFeedback>
                    <Input type={flag ? 'password' : 'txt'}
                        addonBefore={<span onClick={() => {
                            this.setState({
                                flag: !flag
                            });
                        }}>{flag ? <LockOutlined /> : <UnlockOutlined />}</span>} />

                </FormItem>

                <FormItem name="password" rules={[{
                    type: 'string',
                    message: '长度6-18，只能包含小写英文字母、数字、下划线，且以字母开头',
                    pattern: /^[a-zA-Z]\w{5,17}$/,
                    required: true,
                    whitespace: true
                }]}
                    {...CTYPE.dialogItemLayout}
                    label={(
                        <span>新密码</span>
                    )}
                    hasFeedback>
                    <Input type={flag ? 'password' : 'txt'} addonBefore={<span onClick={() => {
                        this.setState({
                            flag: !flag
                        });
                    }}>{flag ? <LockOutlined /> : <UnlockOutlined />}</span>} />

                </FormItem>

                <FormItem name="repeatPassword" rules={[{
                    type: 'string',
                    message: '长度6-18，只能包含小写英文字母、数字、下划线，且以字母开头',
                    pattern: /^[a-zA-Z]\w{5,17}$/,
                    required: true,
                    whitespace: true
                }]}
                    {...CTYPE.dialogItemLayout}
                    label={(
                        <span>确认新密码</span>
                    )}
                    hasFeedback>
                    <Input type={flag ? 'password' : 'txt'} addonBefore={<span onClick={() => {
                        this.setState({
                            flag: !flag
                        });
                    }}>{flag ? <LockOutlined /> : <UnlockOutlined />}</span>} />
                </FormItem>

            </Form>
        </Modal>
    }
}
