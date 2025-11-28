// ----------------------------------------------------------------------
// --- OPTIMAL ASYNCHRONOUS INITIALIZATION STRATEGY ---
// This is the best practice for Node.js: Start initialization in the
// global scope, but use an async Promise so the handler can await it.
// ----------------------------------------------------------------------

console.log("Starting minimal global initialization (Should be fast)...");

let _mockHeavyDependencyPromise = null;

// This function starts the heavy initialization *asynchronously* using a Promise.
const initializeHeavyDependencyAsync = () => {
    // If the Promise is already running or complete, return it immediately.
    if (_mockHeavyDependencyPromise !== null) {
        return _mockHeavyDependencyPromise;
    }

    // --- COLD START PATH ---
    // Start the Promise (it immediately begins the work) and store it globally.
    _mockHeavyDependencyPromise = new Promise(resolve => {
        console.log("Dependency Promise is NULL. Starting 500ms synchronous initialization...");
        const INIT_START = Date.now();
        
        // Synchronous wait (This still blocks the global scope startup for 500ms)
        while (Date.now() - INIT_START < 500) { /* BLOCKING THREAD */ }
        
        const INIT_DURATION = Date.now() - INIT_START;
        console.log(`Initialization Promise finished in: ${INIT_DURATION.toFixed(2)}ms`);

        // Resolve the Promise with the data
        resolve({
            name: "HEAVY_DEPENDENCY_READY_ASYNC",
            initDuration: INIT_DURATION
        });
    });

    return _mockHeavyDependencyPromise;
};

// Start the initialization immediately in the global scope!
// The result is stored in the Promise variable.
const HEAVY_DEPENDENCY_PROMISE = initializeHeavyDependencyAsync();


// ----------------------------------------------------------------------
// --- HANDLER FUNCTION (Must be async to await the Promise) ---
// ----------------------------------------------------------------------

exports.demoColdStart = async (req, res) => {
    // === CORS HEADERS (Mandatory for client-side testing) ===
    res.set('Access-Control-Allow-Origin', '*'); 

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }
    // ===============================================

    const handlerStart = Date.now();
    
    // === AWAITING THE GLOBAL INITIALIZATION PROMISE ===
    // Cold Start: This line waits the remaining time for the global Promise to finish.
    // Hot Start: The Promise is already resolved, so this line is nearly instant.
    const dependency = await HEAVY_DEPENDENCY_PROMISE;

    // The handler's own minimal work
    console.log(`Using mock dependency: ${dependency.name}`);
    
    // The server duration will now reflect:
    // Cold Start: <10ms (if the dependency loaded in the background)
    // Hot Start: <10ms
    const serverDurationMs = Date.now() - handlerStart;

    res.status(200).json({
        serverDurationMs: serverDurationMs.toFixed(2),
        initDurationMs: dependency.initDuration.toFixed(2), 
        message: "Data fetched successfully using optimal async loading."
    });
};
