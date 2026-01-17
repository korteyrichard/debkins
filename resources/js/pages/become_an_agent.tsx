import { Head, useForm, usePage } from '@inertiajs/react';

export default function BecomeAnAgent() {
    const props = usePage().props as any;
    const agentFee = props.agentFee || 50;
    const { post, processing, errors } = useForm();

    const handleBecomeAgent = (e: React.FormEvent) => {
        e.preventDefault();
        post('/become_an_agent');
    };

    return (
        <>
            <Head title="Become an Agent - debikinsdataplug" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-blue-900 dark:to-blue-800 px-4 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 max-w-2xl text-center space-y-6">
                    <img src='/affiliatesconnects.jpg' alt="Affiliates Connects Logo" className="w-20 h-20 mx-auto mb-4 rounded-lg" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">
                        Gain Api Access
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        getting access to our API means faster order processing from your website and cheaper price for data bundles.
                    </p>

                    <form onSubmit={handleBecomeAgent}>
                        <input type="hidden" name="amount" value={agentFee} />
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-block mt-4 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : `Pay GHS ${agentFee} to Gain API Access`}
                        </button>
                        {errors.message && <p className="text-red-500 text-sm mt-2">{errors.message}</p>}
                    </form>
                </div>
            </div>
        </>
    );
}
