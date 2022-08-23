import React from "react";
import { App, U, Utils } from "../../common";
import Specs from "./Specs";
import { Breadcrumb, Tag } from "antd";
import TemplateSpecs from "./TemplateSpecs";

let ProductUtils = (() => {
    let id2sequence = (types, id) => {
        let sequence = '';
        types.map((t1) => {
            if (t1.id === id) {
                sequence = t1.sequence;
            }
            t1.children.map((t2) => {
                if (t2.id === id) {
                    sequence = t2.sequence;
                }
                t2.children.map((t3) => {
                    if (t3.id === id) {
                        sequence = t3.sequence;
                    }
                })
            })
        });
        return sequence;

    };
    let drawer = (productId) => {
        Utils.common.renderReactDOM(<Specs productId={productId} />);
    };
    let templateDrawer = (productTemplateId) => {
        Utils.common.renderReactDOM(<TemplateSpecs productTemplateId={productTemplateId} />);
    };
    let renderCateTags = (cateId, cates = []) => {

        return <React.Fragment>
            {cates.map((item1, index) => {
                let { children = [] } = item1;
                return <React.Fragment key={index}>
                    {children.map((item2, index2) => {
                        let { children = [] } = item2;
                        return <React.Fragment key={index2}>
                            {children.map((item3, index3) => {

                                if (item3.id == cateId) {
                                    return <React.Fragment key={index3}>
                                        <Tag color={item1.status == 1 ? 'blue' : item1.status == 2 ? 'orange' : item1.status == 3 ? 'red' : ''}>{item1.name}</Tag>
                                        <Tag color={item2.status == 1 ? 'blue' : item2.status == 2 ? 'orange' : item2.status == 3 ? 'red' : ''}>{item2.name}</Tag>
                                        <Tag color={item3.status == 1 ? 'blue' : item3.status == 2 ? 'orange' : item3.status == 3 ? 'red' : ''}>{item3.name}</Tag>
                                    </React.Fragment>
                                }

                            })}
                        </React.Fragment>
                    })}
                </React.Fragment>
            })}
        </React.Fragment>

    }
    let renderCategoryNames = (types, id) => {

        let ret = [];
        if (!types || types.length === 0) {
            return ret;
        }

        if (!id || id === 0) {
            return ret;
        }

        let sequence = id2sequence(types, id);

        if (U.str.isEmpty(sequence)) {
            return ret;
        }

        types.map((t1, index1) => {
            if (t1.sequence.substr(0, 2) === sequence.substr(0, 2)) {
                ret.push(<Breadcrumb.Item key={index1}>{t1.title}</Breadcrumb.Item>);
                t1.children.map((t2, index2) => {
                    if (t2.sequence.substr(0, 4) === sequence.substr(0, 4)) {
                        ret.push(<Breadcrumb.Item key={`${index1}-${index2}`}>{t2.title}</Breadcrumb.Item>);
                        t2.children.map((t3, index3) => {
                            if (t3.sequence === sequence) {
                                ret.push(<Breadcrumb.Item
                                    key={`${index1}-${index2}-${index3}`}>{t3.title}</Breadcrumb.Item>);
                            }
                        })
                    }
                })
            }
        });

        return <Breadcrumb separator=">">{ret}</Breadcrumb>

    };
    let loadProductCategories = () => {
        return App.api('merchant/product/categories').then((productCategories) => {
            return new Promise((resolve, reject) => {
                resolve(productCategories);
            });
        });
    };

    let brands = [];

    let filterBrands = (sequence) => {
        let ret = [];
        brands.map((brand) => {
            let { productCategorySequences = [] } = brand;
            productCategorySequences.map((code) => {
                if ((code.length == 2 && code === sequence.substr(0, 2)) ||
                    (code.length == 4 && code === sequence.substr(0, 4)) ||
                    code === sequence
                ) {
                    ret.push(brand);
                }
            });
        });
        return ret;
    };
    let loadBrands = (categoryId, productCategories) => {

        let sequence = id2sequence(productCategories, categoryId);
        if (U.str.isEmpty(sequence)) {
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        } else {
            if (brands.length === 0) {
                return App.api('merchant/product/all_brands').then((_brands) => {
                    brands = _brands;
                    return new Promise((resolve, reject) => {
                        let ret = filterBrands(sequence);
                        resolve(ret);
                    });
                });
            } else {
                return new Promise((resolve, reject) => {
                    let ret = filterBrands(sequence);
                    resolve(ret);
                });
            }
        }
    };
    return {
        renderCateTags, drawer, loadBrands, renderCategoryNames, loadProductCategories,templateDrawer
    }
})();
export default ProductUtils;