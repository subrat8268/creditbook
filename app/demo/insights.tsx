import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Users, ShoppingBag, Bell } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { colors } from '../../src/utils/theme';

/**
 * Modern Insights Screen
 * Demonstrates the combined capabilities of:
 * - frontend-master-agent (Modern UI, NativeWind)
 * - visual-art-agent (Gradients, Icons, Layout)
 */
export default function InsightsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F6F7F9]">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <Animated.View entering={FadeInUp.delay(100)} className="flex-row items-center justify-between py-6">
          <View>
            <Text className="text-3xl font-bold text-[#1C1C1E]">Insights</Text>
            <Text className="text-[#6B7280]">Real-time business performance</Text>
          </View>
          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Bell size={24} color={colors.textPrimary} />
          </Pressable>
        </Animated.View>

        {/* Main Stat Card (Visual Art Agent influence) */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6 shadow-xl"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white/80 font-medium">Net Position</Text>
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-bold text-white">+12.5%</Text>
              </View>
            </View>
            <Text className="mt-2 text-4xl font-bold text-white">₹4,82,950</Text>
            
            <View className="mt-8 flex-row justify-between border-t border-white/20 pt-6">
              <View>
                <View className="flex-row items-center">
                  <ArrowDownLeft size={16} color="white" />
                  <Text className="ml-1 text-white/80 text-xs">To Receive</Text>
                </View>
                <Text className="text-lg font-bold text-white">₹6,20,000</Text>
              </View>
              <View>
                <View className="flex-row items-center">
                  <ArrowUpRight size={16} color="white" />
                  <Text className="ml-1 text-white/80 text-xs">To Pay</Text>
                </View>
                <Text className="text-lg font-bold text-white">₹1,37,050</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Secondary Stats Row */}
        <View className="mt-6 flex-row justify-between">
          <Animated.View entering={FadeInRight.delay(300)} className="w-[48%] rounded-3xl bg-white p-4 shadow-sm">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Users size={20} color={colors.fab} />
            </View>
            <Text className="mt-3 text-[#6B7280] text-xs">Active Customers</Text>
            <Text className="text-xl font-bold text-[#1C1C1E]">124</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInRight.delay(400)} className="w-[48%] rounded-3xl bg-white p-4 shadow-sm">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
              <ShoppingBag size={20} color={colors.supplierPrimary} />
            </View>
            <Text className="mt-3 text-[#6B7280] text-xs">Total Orders</Text>
            <Text className="text-xl font-bold text-[#1C1C1E]">842</Text>
          </Animated.View>
        </View>

        {/* Action Section */}
        <Animated.View entering={FadeInUp.delay(500)} className="mt-6 rounded-3xl bg-[#1C1C1E] p-6 mb-10">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Smart Follow-up</Text>
              <Text className="mt-1 text-white/60">3 customers are overdue by more than 15 days.</Text>
            </View>
            <TrendingUp size={32} color={colors.primary} />
          </View>
          <Pressable className="mt-6 items-center justify-center rounded-2xl bg-white py-4">
            <Text className="font-bold text-[#1C1C1E]">Send Reminders</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
