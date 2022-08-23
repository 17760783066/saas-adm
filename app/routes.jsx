import React from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import AdminEdit from './components/admin/AdminEdit';
import Admins from './components/admin/Admins';
import RoleEdit from './components/admin/RoleEdit';
import Roles from './components/admin/Roles';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/login/Login';
import Page from './components/Page';
import ProductEdit from './components/product/ProductEdit';
import Products from './components/product/Products';
import ProductTemplate from './components/product/ProductTemplates';
import Trade from './components/trade/Trade';
import Index from './Index';
const routes = (
    <HashRouter>
        <Switch>
            <Route path='/' children={() => (
                <Page>
                    <Switch>

                        <Redirect exact from='/' to='/app/dashboard/index' />

                        <Route path='/' exact component={Index} />

                        <Route path='/login' exact component={Login} />

                        <Route path='/app' children={() => (
                            <Index>

                                <Route path='/app/dashboard/index' component={Dashboard} />

                                <Route path={'/app/admin/admins'} component={Admins} />
                                <Route path={'/app/admin/admin-edit/:id'} component={AdminEdit} />
                                <Route path={'/app/admin/roles'} component={Roles} />
                                <Route path={'/app/admin/role-edit/:id'} component={RoleEdit} />
                                <Route path={'/app/product/product-templates'} component={ProductTemplate} />
                                <Route path={'/app/product/product-edit/:templateId/:productId'} component={ProductEdit} />
                                <Route path={'/app/product/products'} component={Products} />
                                <Route path={'/app/trade/trades'} component={Trade} />

                            </Index>
                        )} />
                    </Switch>
                </Page>
            )}>
            </Route>
        </Switch>
    </HashRouter>
);


export default routes;
