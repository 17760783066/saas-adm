import { ConfigProvider, Tag } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom';
import DialogQRCode from "../components/common/DialogQRCode";
import App from './App';
import ImgEditor from "./ImgEditor";
import ImgLightbox from "./ImgLightbox";
import { CTYPE, KvStorage, U } from "./index";
import LocationPicker from "./LocationPicker";
import Spider from "./Spider";
import XiumiEditor from "./XiumiEditor";

const statusArr = [{ key: 1, label: '启用', tag: '启用' }, { key: 2, label: '停用', tag: <Tag color="warning">停用</Tag> }];
const typeArr = [{key:1,label:'待付款',tag:'待付款'},{key:2,label:'已付款',tag:'已付款'},{key:3,label:'已发货',tag:'已发货'},{key:4,label:'交易已完成',tag:'交易已完成'},{key:5,label:'交易已关闭',tag:'交易已关闭'}]
let Utils = (function () {

    let _setCurrentPage = (key, pageno) => {
        sessionStorage.setItem(key, pageno);
    };

    let _getCurrentPage = (key) => {
        return sessionStorage.getItem(key) ? parseInt(sessionStorage.getItem(key)) : 1;
    };

    let _setTabIndex = (key, index) => {
        sessionStorage.setItem(key, index);
    };

    let _getTabIndex = (tabKey) => {
        return sessionStorage.getItem(tabKey) ? parseInt(sessionStorage.getItem(tabKey)) : 0;
    };

    let qrcode = (() => {

        let show = (url, avatar, title, copyStr) => {
            common.renderReactDOM(<DialogQRCode url={url} avatar={avatar} title={title} copyStr={copyStr} />);
        };

        return { show };
    })();


    let common = (() => {

        let renderReactDOM = (child, options = {}) => {

            let div = document.createElement('div');
            let { id } = options;
            if (id) {
                let e = document.getElementById(id);
                if (e) {
                    document.body.removeChild(e);
                }
                div.setAttribute('id', id);
            }

            document.body.appendChild(div);
            ReactDOM.render(<ConfigProvider locale={zhCN}>{child}</ConfigProvider>, div);
        };

        let closeModalContainer = (id_div) => {
            let e = document.getElementById(id_div);
            if (e) {
                document.body.removeChild(e);
            }
        };

        let createModalContainer = (id_div) => {
            //强制清理同名div，render会重复创建modal
            closeModalContainer(id_div);
            let div = document.createElement('div');
            div.setAttribute('id', id_div);
            document.body.appendChild(div);
            return div;
        };

        let showImgLightbox = (images, index) => {
            common.renderReactDOM(<ImgLightbox images={images} index={index} show={true} />);
        };

        let showImgEditor = (aspectRatio, img, syncImg) => {
            common.renderReactDOM(<ImgEditor aspectRatio={aspectRatio} img={img}
                syncImg={syncImg} />, { id: 'div-img-editor' });
        };

        let xiumiEditor = (syncContentWrap) => {
            common.renderReactDOM(<XiumiEditor syncContentWrap={syncContentWrap} />);
        };

        let wxSpider = (onSpiderOK) => {
            common.renderReactDOM(<Spider onSpiderOK={onSpiderOK} />);
        };

        let locationPicker = (syncLocation) => {
            common.renderReactDOM(<LocationPicker syncLocation={syncLocation} />);
        };

        return {
            renderReactDOM, closeModalContainer, createModalContainer, showImgLightbox, showImgEditor,
            xiumiEditor, wxSpider, locationPicker
        };
    })();

    let addr = (() => {

        let regions = [];

        let loadRegion = (component) => {
            if (regions && regions.length > 0) {
                component.setState({
                    regions: regions
                });
            } else {
                fetch(CTYPE.REGION_PATH).then(res => {
                    res.json().then((_regions) => {
                        regions = _regions;
                        component.setState({
                            regions: _regions
                        });
                    });
                });
            }
        };

        let getCodes = (code) => {
            let codes = ['41','4101','410104'];
            if (code && code.length === 6) {
                codes[0] = code.substr(0, 2);
                codes[1] = code.substr(0, 4);
                codes[2] = code;
            } 
            return codes;
        };

        let getPCD = (code) => {
            console.log(code);
            if (!regions || regions.length === 0 || !code || code === '') {
                return null;
            }
            let codes = getCodes(code);
            let pcd = '';
            regions.map((r1, index1) => {
                if (r1.value === codes[0]) {
                    pcd = r1.label;
                    r1.children.map((r2, index2) => {
                        if (r2.value === codes[1]) {
                            pcd += ' ' + r2.label;
                            r2.children.map((r3, index3) => {
                                console.log(r3);
                                if (r3.value === code) {
                                    pcd += ' ' + r3.label;
                                }
                            })
                        }
                    })
                }
            });
            console.log(pcd);
            return pcd;
        };

        return { loadRegion, getPCD, getCodes };

    })();

    let adminPermissions = null;

    let adm = (() => {

        let avatar = (img) => {
            return img ? img : '';
        };

        let savePermissions = (permissions) => {
            KvStorage.set('admin-permissions', permissions);
            initPermissions();
        };

        let getPermissions = () => {
            return KvStorage.get('admin-permissions') || '';
        };

        let authPermission = (f) => {
            return getPermissions().includes(f);
        };

        let initPermissions = () => {
            if (getPermissions() === '') {
                return;
            }
            Utils.adminPermissions = {
                ROLE_LIST: authPermission("ROLE_LIST"),
                ROLE_EDIT: authPermission('ROLE_EDIT'),

                ADMIN_EDIT: authPermission('ADMIN_EDIT'),
                ADMIN_LIST: authPermission('ADMIN_LIST'),
                PRODUCT_EDIT:authPermission('PRODUCT_EDIT'),
                MERCHANT_LIST: authPermission('MERCHANT_LIST'),
                SETTING:authPermission('SETTING'),
                RENEW_LIST:authPermission('RENEW_LIST'),

            };
        };

        let clearPermissions = () => {
            Utils.adminPermissions = null;
            KvStorage.remove('admin-permissions');
        };

        return { avatar, savePermissions, initPermissions, clearPermissions };

    })();


    let num = (() => {

        let formatPrice = value => {
            value = value / 100;
            value += '';
            const list = value.split('.');
            const prefix = list[0].charAt(0) === '-' ? '-' : '';
            let num = prefix ? list[0].slice(1) : list[0];
            let result = '';
            while (num.length > 3) {
                result = `,${num.slice(-3)}${result}`;
                num = num.slice(0, num.length - 3);
            }
            if (num) {
                result = num + result;
            }
            return `¥ ${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
        };

        let num2Chinese = (num) => {
            let chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
            let chnUnitChar = ["", "十", "百", "千"];

            let strIns = '', chnStr = '';
            let unitPos = 0;
            let zero = true;
            while (num > 0) {
                let v = num % 10;
                if (v === 0) {
                    if (!zero) {
                        zero = true;
                        chnStr = chnNumChar[v] + chnStr;
                    }
                } else {
                    zero = false;
                    strIns = chnNumChar[v];
                    strIns += chnUnitChar[unitPos];
                    chnStr = strIns + chnStr;
                }
                unitPos++;
                num = Math.floor(num / 10);
            }

            chnStr = U.str.replaceAll(chnStr, '一十', '十');

            return chnStr;
        };

        return {
            formatPrice, num2Chinese
        };

    })();

    let pager = (() => {

        let convert2Pagination = (result) => {

            let { pageable = {}, totalElements } = result;

            let pageSize = pageable.pageSize || CTYPE.pagination.pageSize;
            let current = pageable.pageNumber + 1;

            return {
                current,
                total: totalElements,
                pageSize
            };
        };

        let getRealIndex = (pagination, index) => {
            return (pagination.current - 1) * pagination.pageSize + index + 1;
        };

        return { convert2Pagination, getRealIndex };

    })();

    let getStatus = (status) => {
        return statusArr.find(item => item.key == status) || { label: '错误', tag: '错误' };
    };
    let getType = (type) => {
        return typeArr.find(item => item.key == type) || { label: '错误', tag: '错误' };
    };

    let renderStatusCol = () => {
        return {
            title: '状态',
            dataIndex: 'status',
            align: 'center',
            width: '60px',
            render: (status) => Utils.getStatus(status).tag
        }
    }


    return {
        common, adm, num, pager, qrcode, adminPermissions,
        addr, getStatus, renderStatusCol,getType,
        _setCurrentPage, _getCurrentPage, _setTabIndex, _getTabIndex
    };

})();

export default Utils;
