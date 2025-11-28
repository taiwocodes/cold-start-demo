// ----------------------------------------------------------------------
// --- LAZY LOADING STRATEGY ---
// The heavy dependency is moved inside the handler, but guarded by a
// global variable to ensure it only runs once per container (Cold Start).
// ----------------------------------------------------------------------

console.log("Starting minimal global initialization (Should be fast)...");

// Use a global variable to hold the initialized dependency state.
// Initially, it is undefined/null.
let _mockHeavyDependency = null;

// This function simulates the heavy initialization.
const initializeHeavyDependency = () => {
    if (_mockHeavyDependency !== null) {
        console.log("Dependency already initialized. Skipping 500ms wait.");
        return _mockHeavyDependency;
    }

    // --- COLD START PATH ---
    console.log("Dependency is NULL. Running 500ms synchronous initialization...");
    const INIT_START = Date.now();
    
    // Synchronous wait
    while (Date.now() - INIT_START < 500) { /* BLOCKING THREAD */ }
    
    const INIT_DURATION = Date.now() - INIT_START;
    
    // Store the result globally for future (Hot Start) requests.
    _mockHeavyDependency = {
        name: "HEAVY_DEPENDENCY_READY",
        initDuration: INIT_DURATION
    };

    console.log(`Initialization finished in: ${INIT_DURATION.toFixed(2)}ms`);
    return _mockHeavyDependency;
};

// ----------------------------------------------------------------------
// --- HANDLER FUNCTION (Runs on every request, HOT or COLD) ---
// ----------------------------------------------------------------------

exports.demoColdStart = (req, res) => {
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
    
    // === LAZY LOADING HAPPENS HERE ===
    const dependency = initializeHeavyDependency();

    // The handler's own minimal work
    console.log(`Using mock dependency: ${dependency.name}`);
    
    // The server duration will now correctly reflect:
    // Cold Start: ~500ms (due to initializeHeavyDependency)
    // Hot Start: <10ms (since initializeHeavyDependency skips the wait)
    const serverDurationMs = Date.now() - handlerStart;

    res.status(200).json({
        serverDurationMs: serverDurationMs.toFixed(2),
        // We can check the initialization time to confirm the path taken
        initDurationMs: dependency.initDuration.toFixed(2), 
        message: "Data fetched successfully using lazy loading."
    });
};
