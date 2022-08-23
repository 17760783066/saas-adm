import { type } from 'jquery';
import React, { Component } from 'react';
import { FileAddOutlined } from '_@ant-design_icons@4.7.0@@ant-design/icons';
import { Button, Card } from '_antd@4.19.2@antd';
import { App, CTYPE } from '../../common';
import BreadcrumbCustom from '../BreadcrumbCustom';

class Setting extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {

    }
    add =()=>{
        App.go(`/app/setting/ui-edit/`)

    }
    render() {
        return (
            <div>
                <BreadcrumbCustom first={CTYPE.link.uis.txt} />
                <Card extra={<Button icon={<FileAddOutlined />} type="primary" onClick={()=>{this.add()}}>新建模版</Button>}>

                </Card>
            </div>
        );
    }
}

export default Setting;