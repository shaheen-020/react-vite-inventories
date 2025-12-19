import React from "react";
import MainLayout from "./Layout/MainLayout";

export default function ComingSoon() {
    return (
        <MainLayout>
            <section className="section">
                <div className="section-header">
                    <h1>For Future Updates</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body">
                            <div className="text-center">
                                <h2 className="tw-text-2xl tw-font-bold tw-text-gray-700">Feature Coming Soon</h2>
                                <p className="tw-mt-2 tw-text-gray-500">This feature is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
