import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import React, { useState } from 'react'
import ConsumptionOverview from "../../components/dashboard/ConsumptionOverview";
import ConsumptionDetail from "../../components/dashboard/ConsumptionDetail";
import BudgetTracker from "../../components/dashboard/BudgetTracker";
import ApplianceCards from "../../components/dashboard/ApplianceCards";
import EnergyTips from "../../components/dashboard/EnergyTips";

export default function Consumption() {
    const [showConsumptionDetails, setShowConsumptionDetails] = useState(false);
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="px-4 py-6">
                <View className="space-y-6">
                    {showConsumptionDetails ? (
                        <ConsumptionDetail
                            onBack={() => setShowConsumptionDetails(false)}
                            currentPower={2.4}
                            dailyConsumption={18.7}
                            previousPeriodConsumption={16.2}
                        />
                    ) : (
                        <ConsumptionOverview
                            currentPower={2.4}
                            dailyConsumption={18.7}
                            estimatedCost={156.32}
                            maxPower={5}
                            onViewDetails={() => setShowConsumptionDetails(true)}
                        />
                    )}

                    {!showConsumptionDetails && (
                        <>
                            <BudgetTracker budgetAmount={2500} currentUsage={1875} daysRemaining={12} billingCycleTotal={30} />
                            <ApplianceCards
                                appliances={[
                                    { name: "Air Conditioner", currentPower: 1.2, dailyUsage: 8.5, efficiency: "medium" },
                                    { name: "Refrigerator", currentPower: 0.8, dailyUsage: 5.2, efficiency: "high" },
                                    { name: "Television", currentPower: 0.3, dailyUsage: 2.1, efficiency: "high" },
                                    { name: "Water Heater", currentPower: 2.5, dailyUsage: 4.7, efficiency: "low" },
                                    { name: "Washing Machine", currentPower: 0.1, dailyUsage: 1.8, efficiency: "medium" },
                                ]}
                            />
                            <EnergyTips />
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}