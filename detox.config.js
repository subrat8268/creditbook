/**
 * Detox configuration for KredBook (Expo + React Native)
 * 
 * Supported configurations:
 * - android.device.debug: Physical Android device (wireless debugging via ADB)
 * - android.emu.debug: Android emulator
 * - ios.sim.debug: iOS simulator
 * 
 * Usage:
 *   detox test --configuration android.device.debug
 *   detox test --configuration android.emu.debug
 *   detox test --configuration ios.sim.debug
 */

module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
  },
  apps: {
    // Physical Android device (wireless debugging)
    'android.device.debug': {
      type: 'android.attached',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
    // Android emulator
    'android.emu.debug': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
    // iOS simulator
    'ios.sim.debug': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/creditbook.app',
      build:
        'xcodebuild -workspace ios/creditbook.xcworkspace -scheme creditbook -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    // Physical Android device (ADB over WiFi)
    'android-device': {
      type: 'android.attached',
      device: {
        type: 'device',
      },
    },
    // Android emulator
    'android-emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
    },
    // iOS simulator
    'ios-simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
  },
  configurations: {
    // Physical Android device configuration
    'android.device.debug': {
      device: 'android-device',
      app: 'android.device.debug',
    },
    // Android emulator configuration
    'android.emu.debug': {
      device: 'android-emulator',
      app: 'android.emu.debug',
    },
    // iOS simulator configuration
    'ios.sim.debug': {
      device: 'ios-simulator',
      app: 'ios.sim.debug',
    },
  },
};
