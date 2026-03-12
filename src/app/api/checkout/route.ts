import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover', // Best practice: use dated version
});

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // Stripe Price ID (e.g., price_123...)
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/?success=true`,
            cancel_url: `${req.headers.get('origin')}/?canceled=true`,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
