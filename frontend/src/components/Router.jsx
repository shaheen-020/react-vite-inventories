import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AuthLayout from "../pages/Layout/AuthLayout";
import MainLayout from "../pages/Layout/MainLayout";
import Error403 from "../pages/Error/403";
import Error404 from "../pages/Error/404";
import Profile from "../pages/Profile/Profile";
import Medicines from "../pages/Medicines";
import MedicineStock from "../pages/MedicineStock";
import Purchases from "../pages/Purchases";
import Categories from "../pages/Categories";
import Invoices from "../pages/Invoices";
import Customers from "../pages/Customers";
import Suppliers from "../pages/Suppliers";
import Reports from "../pages/Reports";
import Solutions from "../pages/Solutions";
import ComingSoon from "../pages/ComingSoon";

export default function Router() {
    return (
        <Routes>
            <Route path="/403" element={<Error403 />} />
            <Route
                exact
                path="/"
                element={
                    <AuthLayout>
                        <Login />
                    </AuthLayout>
                }
            />
            <Route
                exact
                path="/register"
                element={
                    <AuthLayout>
                        <Register />
                    </AuthLayout>
                }
            />
            <Route
                exact
                path="/dashboard"
                element={
                    <MainLayout>
                        <Dashboard />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/medicines"
                element={
                    <MainLayout>
                        <Medicines />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/stocks"
                element={
                    <MainLayout>
                        <MedicineStock />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/purchases"
                element={
                    <MainLayout>
                        <Purchases />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/invoices"
                element={
                    <MainLayout>
                        <Invoices />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/customers"
                element={
                    <MainLayout>
                        <Customers />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/suppliers"
                element={
                    <MainLayout>
                        <Suppliers />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/category"
                element={
                    <MainLayout>
                        <Categories />
                    </MainLayout>
                }
            />
            <Route path="/rack-location" element={<ComingSoon />} />
            <Route
                exact
                path="/items"
                element={
                    <MainLayout>
                        <Medicines />
                    </MainLayout>
                }
            />
            <Route path="/opening-balance-items" element={<ComingSoon />} />
            <Route path="/stock-in" element={<ComingSoon />} />
            <Route path="/stock-out" element={<ComingSoon />} />
            <Route path="/stock-opname" element={<ComingSoon />} />
            <Route
                exact
                path="/stocks"
                element={
                    <MainLayout>
                        <MedicineStock />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/solutions"
                element={
                    <MainLayout>
                        <Solutions />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/reports"
                element={
                    <MainLayout>
                        <Reports />
                    </MainLayout>
                }
            />
            <Route
                exact
                path="/profile"
                element={
                    <MainLayout>
                        <Profile />
                    </MainLayout>
                }
            />
            <Route path="*" element={<Error404 />} />
        </Routes>
    );
}
