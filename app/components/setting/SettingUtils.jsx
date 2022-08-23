import React from 'react';
import {Utils} from "../../common";
import {ArticlePicker, BannerEdit, CoursePicker, LivePicker, NavEdit, TrainerPicker} from "./SettingComps";

let SettingUtils = (() => {

    const UITypes = [{type: 1, label: '微信首页', disabled: false}, {type: 2, label: 'PC首页', disabled: false}];

    const UIComponentTypes = [
        {
            "key": "AD",
            "name": "广告位"
        },
        {
            "key": "BANNER",
            "name": "轮播图"
        },
        {
            "key": "NAV",
            "name": "二级导航"
        },
        {
            "key": "TOP",
            "name": "搜索框"
        },
        {
            "key": "COURSE",
            "name": "推荐品牌"
        },
        {
            "key": "TRAINER",
            "name": "推荐门店"
        },
        {
            "key": "LIVE",
            "name": "热销商品"
        },
        {
            "key": "ARTICLE",
            "name": "推荐案例"
        }
    ];

    const linkActions = [
        {
            "key": "NONE",
            "name": "无"
        },
        {
            "key": "LINK",
            "name": "链接"
        },
        {
            "key": "COURSE",
            "name": "课程"
        },
        {
            "key": "TRAINER",
            "name": "老师"
        }

    ];

    let bannerEdit = (banner, syncBanner, type) => {
        Utils.common.renderReactDOM(<BannerEdit banner={banner} syncBanner={syncBanner} type={type}/>);
    };

    let coursePicker = (items, syncItems, multi) => {
        Utils.common.renderReactDOM(<CoursePicker items={items} syncItems={syncItems} multi={multi}/>);
    };

    let livePicker = (items, syncItems) => {
        Utils.common.renderReactDOM(<LivePicker items={items} syncItems={syncItems}/>);
    };

    let articlePicker = (items, syncItems) => {
        Utils.common.renderReactDOM(<ArticlePicker items={items} syncItems={syncItems}/>);
    };
    let navEdit = (nav, syncBanner,type) => {
        Utils.common.renderReactDOM(<NavEdit nav={nav} syncBanner={syncBanner} type={type}/>);
    };

    let trainerPicker = (items, syncItems, multi) => {
        Utils.common.renderReactDOM(<TrainerPicker items={items} syncItems={syncItems} multi={multi}/>);
    };

    let parseAct = (b) => {
        let act = '';
        if (b.act === 'NONE') {
            act = '不跳转';
        } else if (b.act === 'LINK') {
            act = '跳转链接';
        } else {
            if (b.payload) {
                act = b.payload.name
            } else {
                act = (SettingUtils.linkActions.find(bn => bn.key === b.act) || {}).name;
            }
        }
        return act;
    };

    return {
        UITypes, UIComponentTypes, linkActions, bannerEdit, coursePicker,
        articlePicker, navEdit,livePicker,
        trainerPicker, parseAct
    }

})();

export default SettingUtils;
