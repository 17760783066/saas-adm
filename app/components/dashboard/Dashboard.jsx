import { Card, Col, Row } from 'antd';
import React from 'react';
import '../../assets/css/home/home.scss';
import BreadcrumbCustom from '../BreadcrumbCustom';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        let { count, validThru } = this.state;
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom />

                <Card>
                    <div className='home-page'>

                        <Row gutter={16}>
                            <Col span={12}>
                            </Col>
                        </Row>

                    </div>
                </Card>

            </div>
        );
    }
}

export default Dashboard;
