import { LockOutlined, PropertySafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal } from 'antd';
import React from 'react';
import { App, KvStorage, U, Utils } from "../../common";
import OEM from '../dashboard/OEM';

const FormItem = Form.Item;

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            oemInfo: {},
            imgSrc: '',
            valCode: { key: 0, code: '' }
        };
        this.formRef = React.createRef();
    }

    isIE = () => { //ie?
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    };

    componentDidMount() {

        this.genValCode();

        //未授权从index被拦截回login时清除loading效果
        message.destroy();

        if (this.isIE()) {
            Modal.warning({
                title: '提示',
                content: (<div>
                    <p>你正在使用的浏览器内核版本过低，微软已经不再提供技术支持，为避免可能存在的安全隐患，请尽快升级你的浏览器或者安装更安全的浏览器（比如 <a
                        href='http://www.google.cn/chrome/browser/desktop/index.html' target='_blank'>Chrome</a>）访问管理平台。
                    </p>
                    <p>如果你正在使用的是双核浏览器，比如QQ浏览器、搜狗浏览器、猎豹浏览器、世界之窗浏览器、傲游浏览器、360浏览器等，可以使用浏览器的极速模式来继续访问管理平台。</p></div>),
            });
        }

        document.addEventListener('keydown', this.doSubmit);

    }

    genValCode = () => {
        let key = new Date().getTime();
        this.setState({ imgSrc: App.API_BASE + '/common/gen_valCode_signin?key=' + key, valCode: { key, code: '' } });
    };

    doSubmit = (e) => {
        if (e.keyCode === 13) {
            this.onSubmit();
        }
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', this.doSubmit);
        OEM.get().then((oemInfo) => {
            this.setState({ oemInfo });
        });

    }

    onSubmit = () => {
        let merchantAdmin = this.formRef.current.getFieldsValue();
        let { mobile = '', password = '', merchantId = '' } = merchantAdmin;
        if (U.str.isEmpty(mobile)) {
            return message.warn('请输入手机号！');
        }
        if (U.str.isEmpty(password)) {
            return message.warn('请输入密码！');
        }
        let { valCode = {} } = this.state;
        merchantAdmin.merchantId = U.getIdFromUrl();
        App.api('merchant/adm/signin', {
            merchantAdmin: JSON.stringify(merchantAdmin),
            valCode: JSON.stringify(valCode)

        }
        ).then(res => {
            let { merchantAdmin = {}, merchantRole = {}, merchantAdminSession = {} } = res;

            Utils.adm.savePermissions(merchantRole.permissions);
            KvStorage.set(`merchantAdmin-profile`, JSON.stringify(merchantAdmin));
            KvStorage.set(`merchantAdminSession-token`, merchantAdminSession.token);

            App.go('');

        });
    };

    render() {

        let { imgSrc, valCode = {} ,oemInfo={}} = this.state;
        let { name, oem = {} } = oemInfo;
        let logo = oem.logoPC || require('../../assets/image/common/logo_white.png');

        return (
            <Card className="login">

                <div className="login-form">
                {name && <img src={logo} className='login-logo'/>}

                    <div className='input-form'>

                        <div className='l-title'>用户登录</div>

                        <Form ref={this.formRef}>
                            <FormItem name="mobile">
                                <Input prefix={<UserOutlined />}
                                    placeholder="请输入账号" size="large" />
                            </FormItem>
                            <FormItem name="password">
                                <Input prefix={<LockOutlined />} type="password"
                                    placeholder="请输入密码" size="large" />
                            </FormItem>
                            <FormItem className='yzm-line'>
                                <Input
                                    prefix={<PropertySafetyOutlined />}
                                    placeholder="验证码" onChange={(e) => {
                                        this.setState({
                                            valCode: {
                                                ...valCode,
                                                code: e.target.value
                                            }
                                        });
                                    }} size="large" />
                                <div className='yzm'>
                                    <img src={imgSrc} onClick={this.genValCode} />
                                    <a onClick={this.genValCode}>看不清，换一张</a>
                                </div>
                            </FormItem>
                            <FormItem>
                                <Button type="primary" htmlType="submit" onClick={this.onSubmit}>
                                    登录
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </Card>

        );
    }
}
