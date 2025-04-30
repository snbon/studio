
// Import the configured ai instance which includes plugins
import './ai-instance';
// Import your flow definitions
import './flows/generate-itinerary';
import './flows/summarize-itinerary';

// Import and start the flows server (optional, if you need to explicitly start it in dev)
// Typically `genkit start` handles this.
// import { startFlowsServer } from './ai-instance';
// startFlowsServer();
