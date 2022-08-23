import React, { Component } from 'react';
import { Drawer, Divider, Descriptions, Tabs, Button, Avatar } from 'antd';
import { App, CTYPE, Utils } from '../../common';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import '../../assets/css/common/specs.scss'
const { TabPane } = Tabs;

class Specs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.productId,
            visible: true,
            placement: 'right',
            three: {}
        }
    }
    componentDidMount() {
        this.loadData(this.state.id);
    }
    loadData = (id) => {
        this.setState({ loading: true });
        App.api(`merchant/product/product_three`, {
            id
        }).then((three) => {
            this.setState({
                three,
                loading: false
            })
        })
    }
    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    render() {
        let { three = {}, placement, visible } = this.state
        let { product = {}, pre = {}, next = {} } = three
        let { name, specs = [], params = [], content} = product
        return <Drawer title={name}
            width='600px'
            placement={placement}
            visible={visible}
            onClose={this.onClose}
            footer={
                <div>
                    <Button onClick={this.onClose}>关闭</Button>
                    <Button type="primary" icon={<RightOutlined />} disabled={!next.id} onClick={() => this.loadData(next.id)}>上一个</Button>
                    <Button type="primary" icon={<LeftOutlined />} disabled={!pre.id} onClick={() => this.loadData(pre.id)}>下一个</Button>
                </div>
            }>

            <div className="header" >
                产品名称
            </div>
            <div className="content">
                {name}
            </div>
            <Divider />
            <div className="header">
                产品规格

            </div>
            <Tabs>
                {specs.map((spec, index) => {
                    let { imgs = [], params = [], price, sno,linePrice ,repertory} = spec;

                    return <TabPane tab={`规格 ${index + 1}`} key={index} closable={index > 0}  >
                        <div className="header">
                            图片
                        </div>
                        <Descriptions layout="horizontal">
                            {imgs.map((img, index2) => {
                                return <Descriptions.Item key={index2} >
                                    {<img style={{ width: 60, height: 60 }} src={img} onClick={() => {
                                        Utils.common.showImgLightbox(img)
                                    }} />}
                                </Descriptions.Item>
                            })}
                        </Descriptions>
                        <div className="header">
                            属性
                        </div>
                        <Descriptions layout="horizontal">
                            {params.map((param, i) => {
                                let { label, value } = param;
                                return <Descriptions.Item key={i} label={label} >
                                    {value}
                                </Descriptions.Item>
                            })}
                        </Descriptions>

                        <div className="header">
                            其他
                        </div>
                        <Descriptions layout="horizontal">
                            <Descriptions.Item key={price} label="金额">
                                {price}
                            </Descriptions.Item>
                            <Descriptions.Item key={linePrice} label="金额">
                                {linePrice}
                            </Descriptions.Item>
                            <Descriptions.Item key={repertory} label="库存">
                                {repertory}
                            </Descriptions.Item>
                            <Descriptions.Item key={sno} label="编号">
                                {sno}
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>
                })}
            </Tabs>
            <Divider />
            <div className="header">
                产品参数

            </div>
            <div className="content">
                <Descriptions layout="horizontal" column={1}>

                    {params.map((param, i) => {
                        let { label, value } = param;
                        return <Descriptions.Item key={i} >
                            {i + 1}. {label}  {value}
                        </Descriptions.Item>
                    })}
                </Descriptions>
            </div>
            <Divider />
            <div className="header">
                产品介绍

            </div>
            <div className="content" dangerouslySetInnerHTML={{ __html: content }} />

        </Drawer>

    }
}

export default Specs;