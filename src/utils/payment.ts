export const initiatePayment = async (courseId: string, amount: number) => {
    try {
        // Create order on backend
        const response = await fetch('/api/v1/payments/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ courseId, amount })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        // Initialize Razorpay
        const options = {
            key: process.env.RAZORPAY_KEY_ID,
            amount: data.order.amount,
            currency: "INR",
            name: "Skillarious",
            description: "Course Purchase",
            order_id: data.order.id,
            handler: async function (response: any) {
                // Verify payment
                const verifyResponse = await fetch('/api/v1/payments/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });

                const verifyData = await verifyResponse.json();
                if (verifyData.success) {
                    // Handle successful payment
                    console.log('Payment successful');
                    // You might want to redirect to a success page or update UI
                }
            },
            prefill: {
                name: "User Name",
                email: "user@example.com"
            },
            theme: {
                color: "#3399cc"
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Payment initiation error:', error);
        throw error;
    }
};