import { ApartmentOutlined, AppstoreOutlined, DatabaseOutlined, HomeOutlined, SettingOutlined, DotChartOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Utils } from "../common";
import CTYPE from "../common/CTYPE";
import OEM from './dashboard/OEM';
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

class SiderCustom extends Component {
    state = {
        collapsed: false,
        mode: 'inline',
        openKey: '',
        selectedKey: '',
        firstHide: false,
        oemInfo: {}


    };

    componentDidMount() {
        this.setMenuOpen();
        OEM.get().then((oemInfo) => {
            this.setState({ oemInfo });
        });

    }

    componentWillReceiveProps(nextProps) {
        this.onCollapse(nextProps.collapsed);
    }

    getPostion = (str, cha, num) => {
        let x = str.indexOf(cha);
        for (let i = 0; i < num; i++) {
            x = str.indexOf(cha, x + 1);
        }
        return x;
    };

    setMenuOpen = () => {

        let path = window.location.hash.split('#')[1];

        //兼容三层目录,三级页不修改，刷新时定位到一级
        let key = path.substr(0, path.lastIndexOf('/'));
        if (key.split('/').length > 3) {
            if (this.state.openKey)
                return;
            key = key.substring(0, this.getPostion(key, '/', 2));
        }

        this.setState({
            openKey: key,
            selectedKey: path
        });
    };

    onCollapse = (collapsed) => {
        this.setState({
            collapsed,
            firstHide: collapsed,
            mode: collapsed ? 'vertical' : 'inline'
        });
    };

    menuClick = e => {
        this.setState({
            selectedKey: e.key
        });

    };
    openMenu = v => {
        this.setState({
            openKey: v[v.length - 1],
            firstHide: false
        });
    };

    render() {

        let {
            ROLE_LIST,
            ROLE_EDIT,
            MERCHANT_LIST,
            ADMIN_LIST,
            RENEW_LIST,
            PRODUCT_EDIT,
        } = Utils.adminPermissions;

        let withAdmin = ADMIN_LIST || ROLE_LIST || ROLE_EDIT;
        let withMerchant = MERCHANT_LIST;
        let withProduct = PRODUCT_EDIT;

        let withFinance = RENEW_LIST;

        let { firstHide, selectedKey, openKey, oemInfo = {} } = this.state;
        let { oem = {} } = oemInfo;


        let { logoAdm, logoSAdm } = oem;


        return (
            <Sider
                trigger={null}
                breakpoint="lg"
                collapsed={this.props.collapsed}
                style={{ overflowY: 'auto' }}>
                <img src={this.props.collapsed ? logoSAdm : logoAdm} className='logo' />


                <Menu
                    onClick={this.menuClick}
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    openKeys={firstHide ? null : [openKey]}
                    onOpenChange={this.openMenu}>
                    <Menu.Item key="/app/dashboard/index">
                        <Link to={'/app/dashboard/index'}><HomeOutlined /><span
                            className="nav-text">首页</span></Link>
                    </Menu.Item>

                    {withFinance && <SubMenu key='/app/finance'
                        title={<span><DatabaseOutlined /><span
                            className="nav-text">订单管理</span></span>}>
                        {RENEW_LIST && <Menu.Item key={CTYPE.link.renews.key}><Link
                            to={CTYPE.link.renews.path}>{CTYPE.link.renews.txt}</Link></Menu.Item>}
                        <Menu.Item key={CTYPE.link.trade.key}><Link
                            to={CTYPE.link.trade.path}>{CTYPE.link.trade.txt}</Link></Menu.Item>
                    </SubMenu>}

                    {withProduct && <SubMenu key='/app/product'
                        title={<span><AppstoreOutlined /><span
                            className="nav-text">产品管理</span></span>}>
                        <Menu.Item key={CTYPE.link.product_templates.key}><Link
                            to={CTYPE.link.product_templates.path}>{CTYPE.link.product_templates.txt}</Link></Menu.Item>
                        <Menu.Item key={CTYPE.link.products.key}><Link
                            to={CTYPE.link.products.path}>{CTYPE.link.products.txt}</Link></Menu.Item>
                    </SubMenu>}


                    {withAdmin && <SubMenu key='/app/admin'
                        title={<span><SettingOutlined /><span
                            className="nav-text">系统管理</span></span>}>
                        {ADMIN_LIST && <Menu.Item key={CTYPE.link.admin_admins.key}><Link
                            to={CTYPE.link.admin_admins.path}>{CTYPE.link.admin_admins.txt}</Link></Menu.Item>}
                        {ROLE_LIST && <Menu.Item key={CTYPE.link.admin_roles.key}><Link
                            to={CTYPE.link.admin_roles.path}>{CTYPE.link.admin_roles.txt}</Link></Menu.Item>}
                    </SubMenu>}


                </Menu>
            </Sider>
        );
    }
}

export default SiderCustom;
