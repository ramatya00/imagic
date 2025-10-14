"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscription, getUserPurchases } from "@/actions/billing";
import { format } from "date-fns";

export default function BillingPage() {
  const { user } = useUser();

  const { data: subscription } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: getUserSubscription,
  });

  const { data: purchases } = useQuery({
    queryKey: ["userPurchases"],
    queryFn: getUserPurchases,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and view your purchase history.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current subscription and credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium capitalize">
                  {subscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Next billing date</span>
                <span className="font-medium">
                  {format(
                    new Date(subscription.currentPeriodEnd),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Credits</span>
                <span className="font-medium">Unlimited</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Credits</span>
                <span className="font-medium">Pay as you go</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            Your previous purchases and credit packs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Credit Pack</p>
                    <p className="text-sm text-muted-foreground">
                      {purchase.credits} credits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(purchase.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(purchase.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No purchases yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
