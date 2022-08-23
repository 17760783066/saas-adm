import React from 'react';

import { App, CTYPE, U, Utils } from '../../common';
import '../../assets/css/common/common-edit.scss'
import { Avatar, Col, Input, message, Modal, Row, Select, Table, Tag } from 'antd';
import SettingUtils from "./SettingUtils";

// import '../../assets/css/common/common-edit.less';
// import TrainerUtils from "../trainer/TrainerUtils";
// import CourseUtils from "../course/CourseUtils";
// import AdminProfile from "../admin/AdminProfile";

const Option = Select.Option;
const InputSearch = Input.Search;

const id_div_banner = 'div-dialog-banenr-edit';

class BannerEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            actions: SettingUtils.linkActions,
            banner: this.props.banner,
            uiType: this.props.type,
            list: []
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            banner: newProps.banner,
            uiType: newProps.type
        });
    }

    syncImg = (url) => {
        let banner = this.state.banner;
        this.setState({
            banner: {
                ...banner,
                img: url
            }
        });
    };

    syncPayload = (items) => {
        let banner = this.state.banner;
        this.setState({
            banner: {
                ...banner,
                payload: items[0]
            }
        });
    };

    doSave = () => {

        let banner = this.state.banner;
        let { img, act, payload = {} } = banner;

        if (U.str.isEmpty(img)) {
            message.warn('请上传图片');
            return;
        }

        if (act === 'LINK' && U.str.isEmpty(payload.url)) {
            message.warn('请填写跳转地址');
            return;
        }

        if (act !== 'NONE' && act !== 'LINK' && !payload.id) {
            message.warn('请选择关联明细');
            return;
        }

        this.props.syncBanner(banner);
        this.close();

    };

    pick = (act, item) => {
        let isCourse = act === 'COURSE';
        let isTrainer = act === 'TRAINER';

        if (isCourse) {
            SettingUtils.coursePicker([item], this.syncPayload, false);
        } else if (isTrainer) {
            SettingUtils.trainerPicker([item], this.syncPayload, false);
        }
    };

    close = () => {
        Utils.common.closeModalContainer(id_div_banner);
    };

    render() {
        let { banner, actions = [], uiType } = this.state;
        let { act = 'NONE', payload = { id: 0, title: '', url: '' }, img, type } = banner;
        let showLink = act === 'LINK';
        let showPicker = act !== 'NONE' && act !== 'LINK';

        let isBanner = type === 'BANNER';
        let isAd = type === 'AD';

        let txt = '轮播图';
        let ratio =  (isBanner ? CTYPE.imgeditorscale.rectangle_h : CTYPE.imgeditorscale.rectangle_ad)
        if (isAd) {
            txt = '广告位';
        }
        let options = { canvasScale: uiType === 1 ? 1 : 2 };
        return <Modal
            getContainer={() => Utils.common.createModalContainer(id_div_banner)}
            visible={true}
            title={`编辑${txt}`}
            width='1000px'
            maskClosable={false}
            onCancel={this.close}
            onOk={this.doSave}>

            <div className="common-edit-page">

                <div className="form">

                    {(isAd || isBanner) && <div className="line">
                        <div className="p required">图片</div>
                        <div className='upload-img-h'
                             onClick={() => Utils.common.showImgEditor(ratio, img, this.syncImg, options)}>
                            {img && <img src={img} className="img" />}
                        </div>
                        {uiType === 1 && <span style={{ marginTop: '50px', marginLeft: '10px' }}>
                            建议上传图片尺寸{isAd ? '345 * 100' : '345 * 200'}，.jpg、.png格式，文件小于1M
                        </span>}
                        {uiType === 2 && <span style={{ marginTop: '50px', marginLeft: '10px' }}>
                            建议上传图片尺寸{isAd ? '1200 * 190' : '1200 * 380'}，.jpg、.png格式，文件小于1M
                        </span>}
                    </div>}

                    <div className="line">
                        <div className='p'>跳转类型</div>
                        <Select
                            showSearch
                            style={{ width: 600 }}
                            optionFilterProp="children"
                            value={act}
                            onChange={(act) => {
                                this.setState({
                                    banner: {
                                        ...banner,
                                        act,
                                    }
                                });
                            }}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                            {actions.map((act) => {
                                return <Option key={act.key}><span
                                    className={act.disabled ? 'font-red' : ''}>{act.name}</span></Option>;
                            })}
                        </Select>
                    </div>

                    {showPicker && <div className="line">
                        <div className='p'>关联明细</div>

                        {!payload.id && <a onClick={() => {
                            this.pick(act, {});
                        }}>选择</a>}
                        {payload.id > 0 && <span>{payload.name}&nbsp;&nbsp;<a onClick={() => {
                            this.pick(act, payload);
                        }}>修改</a></span>}

                    </div>}

                    {showLink && <div className="line">
                        <div className="p required">链接</div>
                        <Input.TextArea className=" textarea" placeholder="输入跳转链接"
                                        value={payload.url}
                                        onChange={(e) => {
                                            this.setState({
                                                banner: {
                                                    ...banner,
                                                    payload: { url: U.str.trim(e.target.value) }
                                                }
                                            });
                                        }} />
                    </div>}
                </div>
            </div>
        </Modal>;
    }
}

const id_div_course = 'div-dialog-course-picker';

class CoursePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: this.props.items,
            multi: this.props.multi,
            categories: [],

            categoryId: 0,
            status: 1,
            q: '',

            list: [],
            pagination: {
                pageSize: CTYPE.pagination.pageSize,
                // current: CourseUtils.getCurrentPage(),
                total: 0,
            },
            loading: false
        };
    }

    componentDidMount() {
        this.loadData();
        // CourseUtils.loadCategories(this);
    }

    loadData = () => {
        let { pagination = {}, categoryId, q } = this.state;
        this.setState({ loading: true });
        App.api('sch/course/courses', {
            courseQo: JSON.stringify({
                categoryId,
                name: q, status: [1],
                pageNumber: pagination.current,
                pageSize: pagination.pageSize
            })
        }).then((result) => {
            let { content = [] } = result;
            let pagination = Utils.pager.convert2Pagination(result);
            this.setState({
                list: content, pagination,
                loading: false
            });
            // CourseUtils.setCurrentPage(pagination.current);
        });
    };

    handleTableChange = (pagination) => {
        this.setState({
            pagination: pagination
        }, () => this.loadData());
    };

    refresh = () => {
        this.setState({
            list: [],
            q: '',
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.loadData();
        });
    };

    singleClick = (item) => {
        this.props.syncItems([item]);
        this.close();
    };

    multiClick = (item) => {
        let { items = [] } = this.state;
        items.push(item);
        this.setState({
            items
        });
        this.props.syncItems(items);
    };

    close = () => {
        Utils.common.closeModalContainer(id_div_course);
    };

    render() {

        let { items = [], multi = false, categories = [], list = [], pagination = {}, loading, categoryId, q, status } = this.state;

        return <Modal
            getContainer={() => Utils.common.createModalContainer(id_div_course)}
            visible={true}
            title={'请选择录播课程'}
            width='1100px'
            maskClosable={false}
            onCancel={this.close}
            footer={null}>
            <div className='common-list'>
                <Row>
                    <Col style={{ textAlign: 'right' }}>

                        <InputSearch style={{ width: '240px', float: 'right' }} value={q}
                                     onChange={(e) => {
                                         this.setState({
                                             q: e.target.value,
                                         });
                                     }}
                                     onSearch={this.loadData}
                                     placeholder="输入关键字" />

                        <Select style={{ width: '150px', float: 'right', marginRight: '10px' }} value={categoryId}
                                onSelect={(v) => {
                                    this.setState({
                                        list: [], categoryId: v
                                    }, () => {
                                        this.refresh();
                                    });
                                }}>
                            <Option value={0}>课程分类</Option>
                            {categories.map((cate, i) => {
                                let { name, status } = cate;
                                if (status !== 1) {
                                    name = name + '  (已下架)';
                                }
                                return <Option key={i} value={cate.id}>{name}</Option>;
                            })}
                        </Select>
                    </Col>
                </Row>
                <div className='clearfix-h20' />
                <Table
                    columns={[{
                        title: '序号',
                        dataIndex: 'id',
                        className: 'txt-center',
                        render: (col, row, i) => Utils.pager.getRealIndex(pagination, i)
                    }, {
                        title: '图片',
                        dataIndex: 'course.imgs',
                        className: 'txt-center',
                        width: '80px',
                        render: (imgs, item, index) => {
                            return <img key={index} className='product-img' src={imgs[0] + '@!120-120'} onClick={() => {
                                Utils.common.showImgLightbox(imgs, 0);
                            }} />;
                        }
                    }, {
                        title: '名称',
                        dataIndex: 'name',
                        className: 'txt-center'
                    }, {
                        title: '免费',
                        dataIndex: 'course.isFree',
                        className: 'txt-center',
                        render: (isFree) => {
                            return isFree === 1 ? '是' : '否';
                        }
                    }, {
                        title: '章节数',
                        dataIndex: 'course.chapterNum',
                        className: 'txt-center'
                    }, {
                        title: '课时数',
                        dataIndex: 'course.classHour',
                        className: 'txt-center'
                    }, {
                        title: '发布时间',
                        dataIndex: 'createdAt',
                        className: 'txt-center',
                        render: (createdAt) => {
                            return U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '状态',
                        dataIndex: 'status',
                        className: 'txt-center',
                        render: (status) => {
                            return <div className="status">
                                {status === 1 ? <span>上架</span> : <span className="warning">下架</span>}</div>;
                        }
                    }, {
                        title: '操作',
                        dataIndex: 'option',
                        className: 'txt-center',
                        render: (obj, course, index) => {
                            let has = items.find(item => item.id === course.id) || {};
                            return <span>
                                {has.id && <span>-/-</span>}
                                {!has.id && <a onClick={() => {
                                    if (multi) {
                                        this.multiClick(course);
                                    } else {
                                        this.singleClick(course);
                                    }
                                }}>选择</a>}
                            </span>;
                        }

                    }]}
                    rowKey={(item) => item.id}
                    dataSource={list}
                    pagination={{ ...pagination, ...CTYPE.commonPagination }}
                    loading={loading} onChange={this.handleTableChange} />
            </div>
        </Modal>;
    }

}

const id_div_live = 'div-dialog-live-picker';

class LivePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: this.props.items,
            multi: this.props.multi,
            categories: [],

            categoryId: 0,
            status: 1,
            q: '',

            list: [],
            pagination: {
                pageSize: CTYPE.pagination.pageSize,
                // current: CourseUtils.getCurrentPage(),
                total: 0,
            },
            loading: false
        };
    }

    componentDidMount() {
        this.loadData();
        // CourseUtils.loadCategories(this);
    }

    loadData = () => {
        let { pagination = {}, categoryId, q } = this.state;
        this.setState({ loading: true });
        App.api('sch/livecourse/live_courses', {
            liveCourseQo: JSON.stringify({
                categoryId,
                name: q, status: [1],
                pageNumber: pagination.current,
                pageSize: pagination.pageSize
            })
        }).then((result) => {
            let { content = [] } = result;
            let pagination = Utils.pager.convert2Pagination(result);
            this.setState({
                list: content, pagination,
                loading: false
            });
            // CourseUtils.setCurrentPage(pagination.current);
        });
    };

    handleTableChange = (pagination) => {
        this.setState({
            pagination: pagination
        }, () => this.loadData());
    };

    refresh = () => {
        this.setState({
            list: [],
            q: '',
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.loadData();
        });
    };

    singleClick = (item) => {
        this.props.syncItems([item]);
        this.close();
    };

    multiClick = (item) => {
        let { items = [] } = this.state;
        items.push(item);
        this.setState({
            items
        });
        this.props.syncItems(items);
    };

    close = () => {
        Utils.common.closeModalContainer(id_div_live);
    };

    render() {

        let { items = [], categories = [], list = [], pagination = {}, loading, categoryId, q, multi } = this.state;

        return <Modal
            getContainer={() => Utils.common.createModalContainer(id_div_live)}
            visible={true}
            title={'请选择直播课程'}
            width='1100px'
            maskClosable={false}
            onCancel={this.close}
            footer={null}>
            <div className='common-list'>
                <Row>
                    <Col style={{ textAlign: 'right' }}>

                        <InputSearch style={{ width: '240px', float: 'right' }} value={q}
                                     onChange={(e) => {
                                         this.setState({
                                             q: e.target.value,
                                         });
                                     }}
                                     onSearch={this.loadData}
                                     placeholder="输入关键字" />

                        <Select style={{ width: '150px', float: 'right', marginRight: '10px' }} value={categoryId}
                                onSelect={(v) => {
                                    this.setState({
                                        list: [], categoryId: v
                                    }, () => {
                                        this.refresh();
                                    });
                                }}>
                            <Option value={0}>课程分类</Option>
                            {categories.map((cate, i) => {
                                let { name, status } = cate;
                                if (status !== 1) {
                                    name = name + '  (已下架)';
                                }
                                return <Option key={i} value={cate.id}>{name}</Option>;
                            })}
                        </Select>
                    </Col>
                </Row>
                <div className='clearfix-h20' />
                <Table
                    columns={[{
                        title: '序号',
                        dataIndex: 'id',
                        className: 'txt-center',
                        render: (col, row, i) => Utils.pager.getRealIndex(pagination, i)
                    }, {
                        title: '图片',
                        dataIndex: 'imgs',
                        className: 'txt-center',
                        width: '80px',
                        render: (imgs, item, index) => {
                            return <img key={index} className='course-img' src={imgs[0] + '@!120-120'} onClick={() => {
                                Utils.common.showImgLightbox(imgs, 0);
                            }} />;
                        }
                    }, {
                        title: '名称',
                        dataIndex: 'name',
                        className: 'txt-center',
                        width: '300px'
                    }, {
                        title: '免费',
                        dataIndex: 'isFree',
                        className: 'txt-center',
                        render: (isFree) => {
                            return isFree === 1 ? '是' : '否';
                        }
                    }, {
                        title: '课程数',
                        dataIndex: 'lessonNum',
                        className: 'txt-center'
                    }, {
                        title: '课时数',
                        dataIndex: 'classHour',
                        className: 'txt-center'
                    }, {
                        title: '发布时间',
                        dataIndex: 'createdAt',
                        className: 'txt-center',
                        render: (createdAt) => {
                            return U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '状态',
                        dataIndex: 'status',
                        className: 'txt-center',
                        render: (status) => {
                            return <div className="status">
                                {status === 1 ? <span>上架</span> : <span className="warning">下架</span>}</div>;
                        }
                    }, {
                        title: '操作',
                        dataIndex: 'option',
                        className: 'txt-center',
                        render: (obj, course, index) => {
                            let has = items.find(item => item.id === course.id) || {};
                            return <span>
                                {has.id && <span>-/-</span>}
                                {!has.id && <a onClick={() => {
                                    if (multi) {
                                        this.multiClick(course);
                                    } else {
                                        this.singleClick(course);
                                    }
                                }}>选择</a>}
                            </span>;
                        }

                    }]}
                    rowKey={(item) => item.id}
                    dataSource={list}
                    pagination={{ ...pagination, ...CTYPE.commonPagination }}
                    loading={loading} onChange={this.handleTableChange} />
            </div>
        </Modal>;
    }

}

const id_div_nav = 'div-dialog-nav-edit';

class NavEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nav: this.props.nav,
            uiType: this.props.type,
        };
    }

    syncImg = (url) => {
        let nav = this.state.nav;
        this.setState({
            nav: {
                ...nav,
                icon: url
            }
        });
    };

    doSave = () => {

        let { nav, uiType } = this.state;
        let { icon, name, type } = nav;
        if (U.str.isEmpty(icon)) {
            message.warn('请上传图标');
            return;
        }

        if (uiType === 1 && U.str.isEmpty(name)) {
            message.warn('请填写名称');
            return;
        }
        if (uiType === 1 && name.length > 5) {
            message.warn('名称不超过五个字');
            return;
        }

        if (U.str.isEmpty(type)) {
            message.warn('请选择类型');
            return;
        }
        this.props.syncBanner(nav);
        this.close();

    };

    close = () => {
        Utils.common.closeModalContainer(id_div_nav);
    };

    render() {
        let { nav = {}, uiType } = this.state;
        let { icon, name, type } = nav;

        let ratio = uiType === 1 ? CTYPE.imgeditorscale.square : CTYPE.imgeditorscale.rectangle_nav_pc;
        const style = { width: '100px', height: '100px' };
        return <Modal
            getContainer={() => Utils.common.createModalContainer(id_div_nav)}
            visible={true}
            title={`编辑二级导航`}
            width='1000px'
            maskClosable={false}
            onCancel={this.close}
            onOk={this.doSave}>
            <div className='common-edit-page'>
                <div className='form'>

                    <div className="line">
                        <div className="p required">图标</div>

                        {uiType === 2 && <React.Fragment>
                            <div className='upload-img-h' style={{ width: '200px', height: '112px' }}
                                 onClick={() => Utils.common.showImgEditor(ratio, icon, this.syncImg)}>
                                {icon && <img style={{ width: '200px', height: '112px' }} src={icon} className="img" />}
                            </div>

                            {uiType === 2 && <span style={{ marginTop: '50px', marginLeft: '10px' }}>
                            建议上传图片尺寸{'285 * 124'}，.jpg、.png格式，文件小于1M
                        </span>}
                        </React.Fragment>}

                        {uiType === 1 && <div className='upload-img-preview' style={style}
                                              onClick={() => Utils.common.showImgEditor(ratio, icon, this.syncImg)}>
                            {icon && <img src={icon} className="img" />}
                        </div>}
                    </div>

                    {uiType === 1 && <div className="line">
                        <div className='p required'>名称</div>
                        <Input style={{ width: '200px' }} maxLength={5} value={name}
                               placeholder='请输入名称'
                               onChange={(e) => this.setState({
                                   nav: {
                                       ...nav,
                                       name: e.target.value
                                   }
                               })} />
                    </div>
                    }
                    <div className="line">
                        <div className='p required'>类型</div>
                        <Select style={{ width: '200px' }} value={type} placeholder='请选择导航类型'
                                onChange={(value) => this.setState({
                                    nav: {
                                        ...nav,
                                        type: value
                                    }
                                })}>
                            <Option value='course'>课程</Option>
                            <Option value='trainer'>老师</Option>
                            <Option value='live'>直播</Option>
                            <Option value='article'>资讯</Option>
                        </Select>
                    </div>
                </div>
            </div>
        </Modal>;

    }

}

const id_div_article = 'div-dialog-article-picker';

class ArticlePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: this.props.items,
            list: [],
            pagination: { pageSize: CTYPE.pagination.pageSize, current: 1, total: 0 },
            loading: false
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        let { pagination = {}, title } = this.state;
        this.setState({ loading: true });
        App.api('/sch/article/articles', {
            articleQo: JSON.stringify({
                title,
                pageNumber: pagination.current,
                pageSize: pagination.pageSize,
                status: 1
            })
        }).then((result) => {
            let { content = [] } = result;
            let pagination = Utils.pager.convert2Pagination(result);
            this.setState({
                list: content, pagination,
                loading: false
            });
        });
    };

    handleTableChange = (pagination) => {
        this.setState({
            pagination: pagination
        }, () => this.loadData());
    };

    close = () => {
        Utils.common.closeModalContainer(id_div_article);
    };

    singleClick = (item) => {
        let { items = [] } = this.state;
        items.push(item);
        this.setState({
            items
        });
        this.props.syncItems(items);
    };

    render() {

        let { items = [], list = [], pagination, loading } = this.state;

        return <Modal
            getContainer={() => Utils.common.createModalContainer(id_div_article)}
            visible={true}
            title={'请选择文章'}
            width='1000px'
            maskClosable={false}
            onCancel={this.close}
            footer={null}>
            <div className='common-list'>
                <Row style={{ padding: '10px 0' }}>
                    <Col span={12}>
                        <InputSearch
                            onChange={(e) => {
                                this.setState({
                                    title: e.target.value,
                                });
                            }}
                            onSearch={this.loadData}
                            placeholder="输入关键字查询" />
                    </Col>
                </Row>
                <Table
                    columns={[{
                        title: '序号',
                        dataIndex: 'index',
                        align: 'center',
                        render: (text, item, index) => index + 1
                    }, {
                        title: '图片',
                        dataIndex: 'img',
                        align: 'center',
                        render: (img) => {
                            return <img key={img} className='square-logo' src={img} />;
                        }
                    }, {
                        title: '标题',
                        dataIndex: 'title',
                        width: 350,
                        render: (title) => {
                            return <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{title}</div>;
                        }
                    }, {
                        title: '状态',
                        dataIndex: 'status',
                        className: 'txt-center',
                        render: (status) => {
                            switch (status) {
                                case 1:
                                    return <Tag color="#2db7f5">启用</Tag>;
                                case 2:
                                    return <Tag color="red">停用</Tag>;
                            }
                        }
                    }, {
                        title: '创建时间',
                        dataIndex: 'createdAt',
                        className: 'txt-center',
                        render: (createdAt) => {
                            return U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '操作',
                        dataIndex: 'option',
                        className: 'txt-center',
                        render: (obj, article, index) => {
                            let has = items.find(item => item.id === article.id) || {};
                            return <span>
                                    {!has.id && <a onClick={() => {
                                        this.singleClick(article);
                                    }}>选择</a>}
                            </span>;
                        }

                    }]}
                    rowKey={(item) => item.id}
                    dataSource={list}
                    pagination={{ ...pagination, ...CTYPE.commonPagination }}
                    loading={loading} onChange={this.handleTableChange} />
            </div>
        </Modal>;
    }
}

const id_div_trainer = 'div-dialog-trainer-picker';

class TrainerPicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: this.props.items,
            multi: this.props.multi,
            q: '',
            list: [],
            pagination: {
                pageSize: CTYPE.pagination.pageSize,
                // current: TrainerUtils.getTrainerCurrentPage(),
                total: 0,
            },
            loading: false,

            status: 1,
        };
    }

    componentDidMount() {
        // AdminProfile.get().then((profile) => {
        //     this.setState({ profile }, () => {
        //         this.loadData();
        //     });
        // });
    }

    getQuery = () => {
        let { status, search, q = [] } = this.state;
        let query = {};
        if (search === true) {
            if (U.str.isNotEmpty(q)) {
                query = { name: q };
            }
        }
        if (status !== 0) {
            query.status = status;
        }
        return query;
    };

    handleTableChange = (pagination) => {
        this.setState({
            pagination: pagination
        }, () => this.loadData());
    };


    loadData = () => {
        let { pagination = {}, profile = {} } = this.state;
        let { admin = {} } = profile;
        let { schoolId } = admin;
        this.setState({ loading: true });
        App.api('sch/trainer/trainers', {
            trainerQo: JSON.stringify({
                ...this.getQuery(),
                schoolId,
                pageNumber: pagination.current,
                pageSize: pagination.pageSize,
            })
        }).then((result) => {
            let { content = [] } = result;
            let pagination = Utils.pager.convert2Pagination(result);
            this.setState({
                list: content, pagination,
                loading: false
            });
            // TrainerUtils.setTrainerCurrentPage(pagination.current);
        });
    };

    close = () => {
        Utils.common.closeModalContainer(id_div_trainer);
    };

    singleClick = (item) => {
        this.props.syncItems([item]);
        this.close();
    };

    multiClick = (item) => {
        let { items = [] } = this.state;
        items.push(item);
        this.setState({
            items
        });
        this.props.syncItems(items);
    };

    render() {
        let { items = [], list = [], multi = false, loading, pagination = {}, q } = this.state;
        return <Modal
            getContainer={() => Utils.common.createModalContainer(id_div_trainer)}
            visible={true}
            title={'请选择讲师'}
            width='1000px'
            maskClosable={false}
            onCancel={this.close}
            footer={null}>
            <div className='common-list'>
                <Row>
                    <Col style={{ textAlign: 'right' }}>
                        <InputSearch
                            placeholder="输入名称查询"
                            style={{ width: 200 }}
                            allowClear={true}
                            value={q}
                            onChange={(e) => {
                                this.setState({ q: e.target.value });
                            }}
                            onSearch={(v) => {
                                this.setState({
                                    q: v, search: true, pagination: {
                                        ...pagination,
                                        current: 1
                                    }
                                }, () => {
                                    this.loadData();
                                });
                            }} />
                    </Col>
                </Row>
                <Table
                    columns={[{
                        title: '序号',
                        dataIndex: 'id',
                        className: 'txt-center',
                        render: (col, row, i) => Utils.pager.getRealIndex(pagination, i)
                    }, {
                        title: '头像',
                        dataIndex: 'avatar',
                        className: 'txt-center ',
                        render: (avatar) => {
                            return <Avatar size="large" icon="user" src={avatar} />;
                        }
                    }, {
                        title: '姓名',
                        dataIndex: 'name',
                        className: 'txt-center',
                    }, {
                        title: '手机号',
                        dataIndex: 'mobile',
                        className: 'txt-center'
                    }, {
                        title: '抬头',
                        dataIndex: 'title',
                        className: 'txt-center',
                    }, {
                        title: '状态',
                        dataIndex: 'status',
                        className: 'txt-center',
                        render: (status) => status === 1 ? "正常" : <span style={{ color: '#f89406' }}>封禁</span>
                    }, {
                        title: '加入时间',
                        dataIndex: 'createdAt',
                        className: 'txt-center',
                        render: (createdAt) => {
                            return U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '操作',
                        dataIndex: 'option',
                        className: 'txt-center',
                        render: (obj, trainer, index) => {
                            let has = items.find(item => item.id === trainer.id) || {};
                            return <span>
                                    {!has.id && <a onClick={() => {
                                        if (multi) {
                                            this.multiClick(trainer);
                                        } else {
                                            this.singleClick(trainer);
                                        }
                                    }}>选择</a>}
                            </span>;
                        }

                    }]}
                    rowKey={(item) => item.id}
                    dataSource={list}
                    pagination={{ ...pagination, ...CTYPE.commonPagination }}
                    loading={loading} onChange={this.handleTableChange} />
            </div>
        </Modal>;

    }
}

export {
    BannerEdit, CoursePicker, LivePicker,
    ArticlePicker, NavEdit, TrainerPicker,
};
