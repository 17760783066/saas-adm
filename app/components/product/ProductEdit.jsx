import { Button, Card, Divider, Form, Input, InputNumber, message, Select, Space, Tabs, TreeSelect } from 'antd';
import React, { Component } from 'react';
import { DeleteOutlined, FileAddOutlined, LeftOutlined, MinusOutlined, PlusOutlined, RightOutlined } from '_@ant-design_icons@4.7.0@@ant-design/icons';
import '../../assets/css/common/categories-edit.scss';
import { App, CTYPE, U, Utils } from '../../common';
import HtmlEditor from "../../common/HtmlEditor";
import ProductUtils from './ProductUtils';
const FormItem = Form.Item;
const { TabPane } = Tabs;
const { Meta } = Card;
const InputGroup = Input.Group;

export default class ProductEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            productId: parseInt(this.props.match.params.productId),
            templateId: parseInt(this.props.match.params.templateId),

            furnish: [],
            productCategories: [],
            product: {},
            brands: [],
            activeIndex: 0
        }
    }
    componentDidMount() {
        ProductUtils.loadProductCategories().then((productCategories) => {
            productCategories.map((item) => {
                let { children = [] } = item;
                children.map((item) => {
                    item.disabled = true;
                })
                item.disabled = true;
                this.setState({ productCategories }, () => {
                })
                this.loadData();
            })
        })
    }
    loadData = () => {
        let { productId, templateId } = this.state
        this.setState({ loading: true });
        productId > 0 && App.api('merchant/product/product', {
            id: productId
        }).then((product) => {
            let { specs = [] } = product;
            specs.map((item) => {
                item.price = (item.price / 100) || 0,
                    item.linePrice = (item.linePrice / 100) || 0;

            });
            this.setState({
                product
            });
            this.loadBrands(product.categoryId);

        });
        templateId > 0 && App.api('merchant/product/template', {
            id: templateId
        }).then((product) => {
            let { specs = [] } = product;
            specs.map((item) => {
                item.price = (item.price / 100) || 0,
                    item.linePrice = (item.linePrice / 100) || 0;

            });
            this.setState({
                product: {
                    ...product,
                    id: null,
                }
            });
            this.loadBrands(product.categoryId);

        });

    }
    loadBrands = (categoryId) => {
        let { productCategories = [] } = this.state;
        ProductUtils.loadBrands(categoryId, productCategories).then((brands) => {
            this.setState({ brands });
        });
    };
    save = () => {

        let { product = {} } = this.state;
        let { specs = [], params = [], status, name, categoryId } = product;
        if (U.str.isEmpty(name)) {
            message.warn('请选择名称');
            return;
        }

        if (categoryId === 0) {
            message.warn('请选择分类');
            return;
        }

        let index_error = -1;
        let error = '';

        let snos = [];
        specs.map((item, index) => {

            let { imgs = [], params = [], sno } = item;

            if (imgs.length === 0) {
                message.warn('请上传图片');
                return;
            }

            if (params.length === 0) {
                index_error = index;
                error = `请填写内容`;
            }

            if (U.str.isEmpty(sno)) {
                index_error = index;
                error = `请填写编号`;
            }
            snos.push(sno);
        });

        if (index_error > -1) {
            message.warn(`第${index_error + 1}组规格填写有误：${error}`);
            return;
        }
        snos = U.array.unique(snos);
        if (snos.length !== specs.length) {
            message.warn('规格编号重复');
            return;
        }

        let index_error_param = -1;
        let error_param = '';
        params.map((item, index) => {
            let { label, value } = item;
            if (U.str.isEmpty(label) || U.str.isEmpty(value)) {
                index_error_param = index;
                error_param = `请填写内容`;
            }
        });

        if (index_error_param > -1) {
            message.warn(`第${index_error_param + 1}组产品参数填写有误：${error_param}`);
            return;
        }

        if (U.str.isEmpty(status)) {
            product.status = 2;
        }
        this.setState({ saving: true });
        App.api('merchant/product/save_product', {
            product: JSON.stringify({
                ...product,
                specs: specs.map((item) => {
                    return {
                        ...item,
                        price: U.toFixed(item.price * 100, 2),
                        linePrice: U.toFixed(item.linePrice * 100, 2)
                    }
                })
            })
        }).then((res) => {
            this.setState({ saving: false });
            message.success('已保存');
            window.history.back();
        }, () => {
            this.setState({ saving: false });
        });
    };
    doSpecOpt = (index, action) => {
        let { product = {}, activeIndex } = this.state;
        let { specs = [] } = product;

        if (action === 'add') {
            specs.push({});
            activeIndex = specs.length - 1;
        } else if (action === 'remove') {
            specs = U.array.remove(specs, index);
        }
        this.setState({
            product: {
                ...product,
                specs
            },
            activeIndex
        });
    };
    syncPoster = (img, index) => {
        this.doImgOpt(index, 0, 'add', img);
    };

    doImgOpt = (index, index2, opt, img) => {
        let { product = {} } = this.state;
        let { specs = [{}] } = product;

        let imgs = specs[index].imgs || [];

        if (opt === 'left') {
            if (index2 === 0) {
                message.warn('已经是第一个');
                return;
            }
            imgs = U.array.swap(imgs, index2, index2 - 1);
        } else if (opt === 'right') {
            if (index2 === imgs.length - 1) {
                message.warn('已经是最后一个');
                return;
            }
            imgs = U.array.swap(imgs, index2, index2 + 1);
        } else if (opt === 'remove') {
            imgs = U.array.remove(imgs, index2);
        } else if (opt === 'add') {
            imgs.push(img);
        }
        specs[index].imgs = imgs;
        this.setState({
            product: {
                ...product,
                specs
            }
        });
    };
    render() {
        let { product = {}, productCategories = [], brands = [], activeIndex } = this.state;
        let { name, categoryId, brandId, specs = [{}], params = [{ label: '', value: '' }], content = '', priority = 1 } = product;
        return (
            <div className="common-edit-page">
                <Card extra={
                    <Button type="primary" icon={<FileAddOutlined />} onClick={() => { this.save() }}>
                        保存
                    </Button>
                }>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='分类'>
                        <TreeSelect
                            treeData={productCategories}
                            showSearch
                            style={{ width: '100%' }}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            treeNodeFilterProp="label"
                            placeholder="请选择分类"
                            allowClear
                            treeDefaultExpandAll
                            fieldNames={{ label: 'name', key: 'sequence', value: 'id' }}
                            value={categoryId}
                            onChange={(v) => {
                                this.setState({
                                    product: {
                                        ...product,
                                        categoryId: v
                                    }
                                })
                                this.loadBrands(v);
                            }}
                        />
                        {ProductUtils.renderCateTags(categoryId, productCategories)}

                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={false} label='品牌'>
                        <Select
                            style={{ width: '100%' }}
                            value={brandId}
                            onChange={(v) => {
                                this.setState({
                                    product: {
                                        ...product,
                                        brandId: v
                                    }
                                })
                            }}
                        >
                            <Option value='0' key={-1}>请选择</Option>
                            {brands.map((g, i) => {
                                return <Option key={i} value={g.id}>{g.name}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='名称'>
                        <Input value={name} placeholder='请输入名称,最多十个字' maxLength={10} style={{ width: '300px' }}
                            onChange={(e) => {
                                this.setState({
                                    product: {
                                        ...product,
                                        name: e.target.value
                                    }
                                })
                            }}
                        />
                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='产品规格'>
                        <div>
                            <Tabs
                                onChange={(activeIndex) => {
                                    this.setState({ activeIndex });
                                }}
                                activeKey={activeIndex.toString()}
                                type="editable-card"
                                onEdit={this.doSpecOpt}
                            >
                                {specs.map((spec, index) => {
                                    let { imgs = [], params = [{ label: '', value: '' }], price, sno, linePrice, repertory } = spec;
                                    return <TabPane tab={`规格 ${index + 1}`} key={index} closable={index > 0}>
                                        <Card title={<span className='required'>图片</span>} size='small'>
                                            <div className='imgs-opt-block'>

                                                {imgs.map((img, index2) => {
                                                    return <Card key={index2} className='img-card-edit'
                                                        cover={<img src={img} />}
                                                        actions={[
                                                            <Card style={{ height: 30 }}>
                                                                <LeftOutlined
                                                                    onClick={() => this.doImgOpt(index, index2, 'left')} />
                                                                <Divider type="vertical" />
                                                                <DeleteOutlined
                                                                    onClick={() => this.doImgOpt(index, index2, 'remove')} />
                                                                <Divider type="vertical" />
                                                                <RightOutlined
                                                                    onClick={() => this.doImgOpt(index, index2, 'right')} />
                                                            </Card>
                                                        ]}
                                                    />
                                                })}

                                                {imgs.length < 6 &&
                                                    <Card cover={<div className='up-icon' />}
                                                        className={'img-card-add'} onClick={() => {
                                                            Utils.common.showImgEditor(CTYPE.imgeditorscale.rectangle_h, null, (img) => this.syncPoster(img, index));
                                                        }}>
                                                        <Meta description='尺寸750*422,小于1M .jpg、.png格式' />
                                                    </Card>}
                                            </div>
                                        </Card>

                                        <div className='clearfix-h20' />

                                        <Card title={<span className='required'>属性</span>} size='small'>
                                            {params.map((param, j) => {
                                                let { label, value } = param;
                                                return <InputGroup compact key={j} style={{ marginBottom: '5px' }}>

                                                    <Input style={{ width: 150 }} placeholder="属性名" value={label}
                                                        onChange={(e) => {
                                                            params[j] = { label: e.target.value, value };
                                                            specs[index].params = params;
                                                            this.setState({
                                                                product: {
                                                                    ...product, specs
                                                                }
                                                            });
                                                        }}
                                                    />

                                                    <Input style={{ width: 500 }} placeholder="属性内容" value={value}
                                                        onChange={(e) => {
                                                            params[j] = { label, value: e.target.value };
                                                            specs[index].params = params;
                                                            this.setState({
                                                                product: {
                                                                    ...product, specs
                                                                }
                                                            });
                                                        }}
                                                    />

                                                    {params.length !== 1 &&
                                                        <Button type='danger' icon={<MinusOutlined />}
                                                            onClick={() => {
                                                                params = U.array.remove(params, j);
                                                                specs[index].params = params;
                                                                this.setState({
                                                                    product: {
                                                                        ...product, specs
                                                                    }
                                                                });
                                                            }}
                                                        />}

                                                    {j === params.length - 1 && params.length < 2 &&
                                                        <Button type='primary' icon={<PlusOutlined />} style={{ marginLeft: '2px' }}
                                                            onClick={() => {
                                                                if (params.length < 2) {
                                                                    params.push({ label: '', value: '' });
                                                                    specs[index].params = params;
                                                                    this.setState({
                                                                        product: {
                                                                            ...product, specs
                                                                        }
                                                                    });
                                                                } else {
                                                                    message.warning('最多添加2个');
                                                                }
                                                            }}
                                                        />}
                                                </InputGroup>
                                            })}
                                        </Card>
                                        <div className='clearfix-h20' />
                                        <Card title={<span className='required'>其他</span>} size='small'>
                                            <FormItem required={true} {...CTYPE.formItemLayout} label='价格'>
                                                <InputNumber value={price} min={1} max={10000} precision={2}
                                                    onChange={(value) => {
                                                        specs[index].price = value;
                                                        this.setState({
                                                            product: {
                                                                ...product, specs
                                                            }
                                                        });
                                                    }}
                                                />
                                            </FormItem>

                                            <FormItem required={true} {...CTYPE.formItemLayout} label='划线价格'>
                                                <InputNumber value={linePrice} min={1} max={10000} precision={2}
                                                    onChange={(value) => {
                                                        specs[index].linePrice = value;
                                                        this.setState({
                                                            product: {
                                                                ...product, specs
                                                            }
                                                        });
                                                    }}
                                                />
                                            </FormItem>
                                            <FormItem required={true} {...CTYPE.formItemLayout} label='库存'>
                                                <InputNumber style={{ width: 100 }}
                                                    value={repertory} min={0}
                                                    onChange={(value) => {
                                                        specs[index].repertory = value;
                                                        this.setState({
                                                            product: {
                                                                ...product, specs
                                                            }
                                                        });
                                                    }}
                                                />
                                            </FormItem>
                                            <FormItem required={true} {...CTYPE.formItemLayout} label='编号'>
                                                <InputNumber style={{ width: 100 }}
                                                    value={sno} min={0}
                                                    onChange={(value) => {
                                                        specs[index].sno = value;
                                                        this.setState({
                                                            product: {
                                                                ...product, specs
                                                            }
                                                        });
                                                    }}
                                                />
                                            </FormItem>
                                        </Card>
                                    </TabPane>
                                })}
                            </Tabs>
                        </div>
                    </FormItem>
                    <FormItem required={true} {...CTYPE.formItemLayout} label='属性'>
                        {params.map((param, k) => {
                            let { label, value } = param;
                            return <InputGroup compact key={k} style={{ marginBottom: '5px' }}>
                                <Input style={{ width: 150 }} placeholder="属性名" value={label}
                                    onChange={(e) => {
                                        params[k] = { label: e.target.value, value };
                                        this.setState({
                                            product: {
                                                ...product, params
                                            }
                                        });
                                    }} />

                                <Input style={{ width: 500 }} placeholder="属性内容" value={value}
                                    onChange={(e) => {
                                        params[k] = { label, value: e.target.value };
                                        this.setState({
                                            product: {
                                                ...product, params
                                            }
                                        });
                                    }} />
                                {params.length !== 1 &&
                                    <Button type='danger' icon={<MinusOutlined />}
                                        onClick={() => {
                                            params = U.array.remove(params, k);
                                            this.setState({
                                                product: {
                                                    ...product, params
                                                }
                                            });
                                        }}
                                    />}

                                {k === params.length - 1 && 
                                    <Button type='primary' icon={<PlusOutlined />} style={{ marginLeft: '2px' }}
                                        onClick={() => {
                                            if (params.length < 100) {
                                                params.push({ label: '', value: '' });
                                                this.setState({
                                                    product: {
                                                        ...product, params
                                                    }
                                                });
                                            } else {
                                                message.warning('最多添加100个');
                                            }
                                        }}
                                    />}
                            </InputGroup>
                        })}

                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='权重'>
                        <Space>
                            <InputNumber
                                min={1}
                                value={priority}
                                onChange={(v) => {
                                    this.setState({
                                        product: {
                                            ...product,
                                            priority: v
                                        }
                                    })
                                }}
                            />

                        </Space>
                    </FormItem>
                    <FormItem
                        {...CTYPE.formItemLayout}
                        label="产品介绍">
                        <HtmlEditor content={content} syncContent={(content) => {
                            this.setState({
                                product: {
                                    ...product,
                                    content
                                }
                            })
                        }} />
                    </FormItem>
                </Card>
            </div>
        );
    }
}
