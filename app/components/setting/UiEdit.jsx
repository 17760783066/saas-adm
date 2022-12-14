import React, { Component } from 'react';
import { FileAddOutlined } from '_@ant-design_icons@4.7.0@@ant-design/icons';
import { Button, Card, Input, Modal, message } from 'antd';
import SettingUtils from './SettingUtils';
import { App, U } from '../../common';
import Sortable from 'sortablejs';
import '../../assets/css/setting/home-ui.scss'
class UiEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: parseInt(this.props.match.params.type),
            id: parseInt(this.props.match.params.id),

            allComponents: SettingUtils.UIComponentTypes,
            actions: SettingUtils.linkActions,
            homeComps: [],
            shakeIndex: -1,
            currModuleIndex: -1,
            currModuleKey: '',

        };
    }

    componentDidMount() {
        this.loadData();

    }
    loadData = () => {

        let { id } = this.state;
        if (!id) {
            return;
        }
        App.api('/sch/ui/ui', { id }).then((result) => {
            console.log(result);
            this.setState({
                title: result.title,
                schoolId: result.schoolId,
                homeComps: result.components,
            }, () => {
                this.filterHomeModules();
            });
        }
        );
    };
    syncBanner = (obj) => {

        let cindex = obj.cindex;
        let item = this.getItemByKey(null, cindex) || {};

        let { list = [] } = item;
        if (obj.index === -1) {
            list.push(obj);
        } else {
            list[obj.index] = obj;
        }
        item.list = list;
        this.setItem(item, cindex);
    };
    itemSortListener = (index) => {
        let banners_saved = document.getElementById('item_sorter_' + index);
        if (banners_saved) {
            let sortable = Sortable.create(banners_saved, {
                dataIdAttr: 'data-id',
                store: {
                    get: () => {
                        let list = this.getItemByKey(null, index).list || [];
                        let sort = [];
                        list.map((s) => {
                            sort.push(JSON.stringify(s));
                        });
                        return sort;
                    },
                    set: (sortable) => {
                        let sort = sortable.toArray();
                        let list = [];
                        sort.map((s) => {
                            list.push(JSON.parse(s));
                        });

                        let item = this.getItemByKey(null, index);
                        item.list = list;
                        this.setItem(item, index);
                    }
                },
                onEnd: () => {
                    setTimeout(() => {
                        let list = this.getItemByKey(null, index).list || [];
                        let sort = [];
                        list.map((s) => {
                            sort.push(JSON.stringify(s));
                        });
                        sortable.sort(sort);
                    }, 10);
                },
            });
        }
    };
    show = (common, index, key, val) => {

        this.setState({
            currModuleIndex: index,
            currModuleKey: common ? key : '',
            [key]: !common ? (val ? val : false) : false,
        }, () => {
            if (['BANNER', 'AD', 'NAV', 'TOP', 'COURSE', 'TRAINER', 'LIVE', 'ARTICLE'].includes(key) && val) {
                this.itemSortListener(index);
            }
        });
    };
    filterHomeModules = () => {
        let { homeComps = [], allComponents = [] } = this.state;

        allComponents.map((am) => {
            homeComps.map((m) => {
                if (am.key === m.key) {
                    m.name = am.name;
                    //????????????????????????????????????
                    if (m.key !== 'AD') {
                        m.title = m.title || am.name;
                    }
                    m.rand = U.str.randomString(4);//!!!?????????????????????comp?????????sort????????????
                }
            });
        });

        homeComps.map((m, i) => {
            m.listStyle = m.listStyle || 1;
            m.commonComp = !['AD', 'BANNER'].includes(m.key);
            m.withTitle = ['TOP', 'COURSE', 'TRAINER', 'LIVE', 'ARTICLE'].includes(m.key);
            m.withMore = ['TOP', 'COURSE', 'TRAINER', 'LIVE', 'ARTICLE'].includes(m.key);
            m.withSortName = ['TOP'].includes(m.key);
        });

        this.setState({
            homeComps
        }, () => {
            this.homeCompsSortListener();
        });
    };
    addHomeComp = (am) => {
        let homeComps = this.state.homeComps;
        let shakeIndex = Math.min(homeComps.length, 2);

        homeComps = U.array.insert(homeComps, shakeIndex, { ...am, title: am.name });

        this.setState({
            homeComps,
            shakeIndex,
        }, () => {
            console.log('addHomeComp', this.state.homeComps);
            this.filterHomeModules();
            this.show(true, shakeIndex, am.key, true);
        });
    };
    removeHomeComp = (index) => {
        this.setState({
            shakeIndex: index
        });
        Modal.confirm({
            title: `???????????????????`,
            onOk: () => {
                let { homeComps = [] } = this.state;
                if (homeComps.length === 1) {
                    message.info('???????????????????????????');
                    return;
                }
                this.setState({
                    homeComps: U.array.remove(homeComps, index),
                    currModuleIndex: -1,
                    currModuleKey: ''
                }, () => {
                    this.filterHomeModules();
                });
            },
            onCancel: () => {
            },
        });
    };
    save = () => {
        let error = false;
        let { id, type, title, homeComps = [], schoolId } = this.state;
        if (U.str.isEmpty(title)) {
            message.warn("???????????????");
            return;
        }

        for (let i = 0, flag = true; i < homeComps.length; flag ? i++ : i) {
            flag = true;
            let am = homeComps[i];
            let key = am.key;
            if (key === 'TOP') {
                error = false;
            } else if ((key === 'BANNER' || key === 'AD') && (!am.list || am.list.length === 0)) {
                message.error('?????????' + (i + 1) + ' ????????? ' + this.getItemByKey(key, i).name + ' ????????????????????????');
                error = true;
            } else if (U.str.isEmpty(am.title)) {
                message.error('?????????' + (i + 1) + ' ????????? ' + this.getItemByKey(key, i).name + ' ???????????????');
                error = true;
            } else if (!am.list || am.list.length === 0) {
                message.error('?????????' + (i + 1) + ' ????????? ' + this.getItemByKey(key, i).name + ' ????????????????????????');
                error = true;
            }
            if (error) {
                return;
            }
        }
        this.setState({ homeComps });

        if (U.str.isEmpty(title)) {
            message.warn("???????????????");
            return;
        }

        // let courses = homeComps.find(value => value.key === 'COURSE') || {};
        // if (courses.list && courses.list.length % 2 !== 0) {
        //     message.error(`??????${courses.title}?????????????????????`);
        //     return;
        // }
        // let trainers = homeComps.find(value => value.key === 'TRAINER') || {};
        // if (type === 1 && trainers.list && trainers.list.length !== 3) {
        //     message.error(`??????${trainers.title}????????????3`);
        //     return;
        // } else if (type === 2 && trainers.list && trainers.list.length !== 4) {
        //     message.error(`??????${trainers.title}????????????4`);
        //     return;
        // }
        let banners = homeComps.find(value => value.key === 'BANNER') || {};
        let ads = homeComps.find(value => value.key === 'AD') || {};
        let navs = homeComps.find(value => value.key === 'NAV') || {};
        if (banners.list && banners.list.length > 10) {
            message.error(`??????${banners.title}???????????????????????????`);
            return;
        } else if (ads.list && ads.list.length > 10) {
            message.error(`??????${ads.title}???????????????????????????`);
            return;
        } else if (navs.list && navs.list.length > 5) {
            message.error(`??????${navs.title}???????????????????????????`);
            return;
        }
        this.setState({ loading: true });
        App.api('/sch/ui/save', {
            ui: JSON.stringify({
                id,
                type,
                title,
                components: homeComps,
                schoolId
            })
        }).then(() => {
            message.success('?????????????????????');
            this.setState({ loading: false });
            App.go(`/app/setting/uis/${type}`);
        }, () => {
            this.setState({ loading: false });
        });
    };
    homeCompsSortListener = () => {
        let home_comps = document.getElementById('home_comps');
        if (home_comps) {
            let sortable = Sortable.create(home_comps, {
                dataIdAttr: 'data-id',
                store: {
                    get: () => {
                        let { homeComps = [] } = this.state;
                        let sort = [];
                        homeComps.map((s) => {
                            sort.push(JSON.stringify(s));
                        });
                        return sort;
                    },
                    set: (sortable) => {
                        let sort = sortable.toArray();
                        let homeComps = [];
                        sort.map((s) => {
                            homeComps.push(JSON.parse(s));
                        });
                        this.setState({
                            homeComps,
                            //???????????????????????????????????????????????????
                            currModuleIndex: -1, currModuleKey: '',
                        });
                    }
                },
                onEnd: () => {
                    setTimeout(() => {
                        let { homeComps = [] } = this.state;
                        let sort = [];
                        homeComps.map((s) => {
                            sort.push(JSON.stringify(s));
                        });
                        sortable.sort(sort);
                    }, 10);
                },
            });
        }
    };

    getItemByKey = (k, index) => {
        let homeComps = this.state.homeComps || [];
        let item = {};
        if (index > -1) {
            return homeComps[index];
        } else {
            homeComps.map((c) => {
                if (c.key === k) {
                    item = c;
                }
            });
        }
        return item;
    };

    setItem = (item, index) => {

        let { homeComps = [] } = this.state;
        if (index > -1) {
            homeComps[index] = item;
        } else {
            homeComps.map((c) => {
                if (c.key === item.key) {
                    c = item;
                }
            });
        }
        this.setState({
            homeComps
        });
    };

    syncItems = (items) => {
        console.log(item);
        let { homeComps = [], currModuleIndex } = this.state;
        let item = homeComps[currModuleIndex];
        item.list = items;
        this.setState({
            homeComps
        });
    };

    render() {
        let { allComponents = [], homeComps = [], title, currModuleIndex, currModuleKey, type } = this.state;
        let isBanner = currModuleKey === 'BANNER';
        let isAd = currModuleKey === 'AD';
        let isNav = currModuleKey === 'NAV';
        let isTop = currModuleKey === 'TOP';
        let isCourse = currModuleKey === 'COURSE';
        let isTrainer = currModuleKey === 'TRAINER';
        let isLive = currModuleKey === 'LIVE';
        let isArticle = currModuleKey === 'ARTICLE';

        let currItem = this.getItemByKey(currModuleKey, currModuleIndex) || {};

        let { list = [] } = currItem;
        return (
            <div className="home-ui-page">
                <Card extra={<Button type="primary" icon={<FileAddOutlined />} loading={this.state.loading}
                    onClick={() => this.save()}>????????????</Button>}>

                    <div style={{ minWidth: '1000px' }}>

                        <Card title="????????????" style={{ width: '250px', float: 'left' }}>
                            <div className="label-type required">????????????</div>
                            <Input defaultValue={title} value={title}
                                onChange={(e) => this.setState({ title: e.target.value })} />

                            <div className="label-type">????????????</div>
                            <ul className='all-modules'>
                                {allComponents.map((m, i) => {
                                    return <li style={{ width: "45%", marginRight: "5%" }} key={i} onClick={() => {
                                        this.addHomeComp(m);
                                    }}><p>{m.name}</p><i /></li>;
                                })}
                            </ul>
                        </Card>
                    </div>
                    <div className='preview-block'>
                        <div className='preview-page'>

                            <ul className='modules' id='home_comps'>
                                {homeComps.map((m, i) => {

                                    let bg_className = m.key;

                                    let className = currModuleIndex === i ? ' highlightborder' : '';

                                    return <li key={i}
                                        data-id={JSON.stringify(m)}
                                        className={className}
                                        onClick={() => this.show(true, i, m.key, true)}>
                                        <div className='close' onClick={() => this.removeHomeComp(i)} />
                                        {m.withTitle &&
                                            <div className='sub-title'><p>{m.title}</p>{m.withMore &&
                                                <a className='more'>??????</a>}</div>}
                                        <div className={bg_className} />

                                    </li>;
                                })}
                            </ul>
                        </div>
                    </div>
                    {currModuleIndex > -1 && <Card title={currItem.name} style={{ width: '400px', float: 'left' }}>
                        <div className='common-module-form'>
                            {currItem.withTitle && <div className='line'>
                                <p className='required'>????????????</p>
                                <Input value={currItem.title} maxLength={24} className='input-wide' onChange={(e) => {
                                    currItem.title = e.target.value;
                                    this.setItem(currItem, currModuleIndex);
                                }} />
                            </div>}
                            {!isTop && <div className='line'>
                                <Button type="primary" icon={<FileAddOutlined/>} onClick={() => {
                                    if (isBanner || isAd) {
                                        let banner = {
                                            index: -1,
                                            cindex: currModuleIndex,
                                            act: 'NONE',
                                            type: currModuleKey
                                        };
                                        SettingUtils.bannerEdit(banner, this.syncBanner, type);
                                    } else if (isTrainer) {
                                        SettingUtils.trainerPicker(list, this.syncItems, true);
                                    } else if (isCourse) {
                                        SettingUtils.coursePicker(list, this.syncItems, true);
                                    } else if (isArticle) {
                                        SettingUtils.articlePicker(list, this.syncItems);
                                    } else if (isLive) {
                                        SettingUtils.livePicker(list, this.syncItems, true);
                                    } else if (isNav) {
                                        let nav = {
                                            index: -1,
                                            cindex: currModuleIndex,
                                        };
                                        SettingUtils.navEdit(nav, this.syncBanner, type);
                                    }
                                }}>????????????</Button>
                            </div>}
                            </div>
                    </Card>}
                </Card>
            </div>
        );
    }
}

export default UiEdit;