import { test, expect } from '@playwright/test';

test('Verify API configuration fix', async ({ page }) => {
  // Capture console messages and errors
  const consoleMessages = [];
  const jsErrors = [];
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  page.on('pageerror', error => {
    jsErrors.push(error.message);
  });
  
  console.log('=== TESTING API CONFIGURATION FIX ===');
  
  // Navigate to the Jarvis website
  await page.goto('https://jarvis-l8gx.onrender.com');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check API configuration messages
  const apiConfigMessages = consoleMessages.filter(msg => 
    msg.text.includes('API') || msg.text.includes('Groq') || msg.text.includes('Google') || msg.text.includes('Tavily')
  );
  
  console.log('API Configuration Messages:');
  for (const msg of apiConfigMessages) {
    console.log(`  ${msg.type}: ${msg.text}`);
  }
  
  // Look for the API URL in the configuration messages
  const apiUrlMessage = apiConfigMessages.find(msg => msg.text.includes('API URL:'));
  if (apiUrlMessage) {
    console.log(`\nAPI URL Configuration: ${apiUrlMessage.text}`);
    
    // Check if it's pointing to the correct production URL
    if (apiUrlMessage.text.includes('jarvis-backend-nzcg.onrender.com')) {
      console.log('✅ API URL is correctly configured for production');
    } else if (apiUrlMessage.text.includes('localhost')) {
      console.log('❌ API URL is still pointing to localhost - this needs to be fixed');
    } else {
      console.log('⚠️ API URL is pointing to an unexpected location');
    }
  }
  
  console.log('\n=== TESTING QUICK RESEARCH FUNCTIONALITY ===');
  
  // Click Quick Research button
  const quickResearchBtn = await page.$('text=Quick Research');
  if (quickResearchBtn) {
    console.log('Clicking Quick Research button...');
    await quickResearchBtn.click();
    
    // Wait for UI transitions
    await page.waitForTimeout(3000);
    
    // Find and fill the search input
    const searchInput = await page.$('input[type="text"]');
    if (searchInput) {
      console.log('Search input found!');
      await searchInput.fill('What is artificial intelligence?');
      
      // Find and click the search button
      const searchButton = await page.$('button:has-text("Search")');
      if (searchButton) {
        console.log('Search button found, clicking...');
        await searchButton.click();
        
        // Wait and monitor network requests
        console.log('Waiting for API response...');
        await page.waitForTimeout(10000);
        
        // Check for JavaScript errors
        console.log(`\nJavaScript errors: ${jsErrors.length}`);
        for (const error of jsErrors) {
          console.log(`  ${error}`);
        }
        
        // Check for network activity
        console.log('\nRecent console messages:');
        const recentMessages = consoleMessages.slice(-10);
        for (const msg of recentMessages) {
          console.log(`  ${msg.type}: ${msg.text}`);
        }
        
        // Check for any content changes that indicate a report
        const pageContent = await page.textContent('body');
        console.log(`\nPage content length: ${pageContent.length}`);
        
        // Look for elements that might contain research results
        const potentialResultElements = await page.$$('.content, .result, .report, [class*="result" i], [class*="report" i], [id*="result" i], [id*="report" i]');
        console.log(`Potential result elements: ${potentialResultElements.length}`);
        
        if (potentialResultElements.length > 0) {
          for (let i = 0; i < Math.min(potentialResultElements.length, 3); i++) {
            const element = potentialResultElements[i];
            const text = await element.textContent();
            const isVisible = await element.isVisible();
            if (text.trim().length > 50 && isVisible) {
              console.log(`  Found potential result ${i}: ${text.substring(0, 100)}...`);
            }
          }
        }
      }
    }
  }
  
  // Take a screenshot for visual inspection
  await page.screenshot({ path: 'jarvis-api-fix-verification.png', fullPage: true });
  console.log('\nVerification screenshot saved as jarvis-api-fix-verification.png');
});