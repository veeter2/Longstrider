#!/usr/bin/env node

/**
 * Safe Update Checker for LongStrider Electron App
 * Run this weekly to see what can be safely updated
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Checking for safe updates...\n');

try {
  // Check outdated packages
  const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
  const outdated = JSON.parse(outdatedOutput);
  
  // Safe updates (low risk)
  const safeUpdates = [
    '@types/node',
    '@types/react-dom', 
    '@types/three',
    'lucide-react',
    'expo',
    'expo-file-system'
  ];
  
  // Medium risk updates (test first)
  const mediumRiskUpdates = [
    'next',
    '@react-three/fiber',
    'tailwind-merge'
  ];
  
  // High risk updates (major version changes)
  const highRiskUpdates = [
    'react',
    'react-dom', 
    'framer-motion',
    'react-spring',
    'tailwindcss',
    'zod'
  ];
  
  console.log('✅ SAFE UPDATES (can update immediately):');
  safeUpdates.forEach(pkg => {
    if (outdated[pkg]) {
      console.log(`  ${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`);
    }
  });
  
  console.log('\n⚠️  MEDIUM RISK UPDATES (test after updating):');
  mediumRiskUpdates.forEach(pkg => {
    if (outdated[pkg]) {
      console.log(`  ${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`);
    }
  });
  
  console.log('\n🚨 HIGH RISK UPDATES (major version changes - be careful):');
  highRiskUpdates.forEach(pkg => {
    if (outdated[pkg]) {
      console.log(`  ${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`);
    }
  });
  
  console.log('\n💡 RECOMMENDED COMMANDS:');
  console.log('Safe updates: npm update @types/node @types/react-dom @types/three lucide-react');
  console.log('Test after each update with: npm run dev');
  console.log('Always backup first: cp package.json package.json.backup');
  
} catch (error) {
  console.log('All packages are up to date! 🎉');
}
