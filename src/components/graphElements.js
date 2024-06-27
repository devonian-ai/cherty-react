

function newGraphVariable (varName, id, backupLocal, version, cid, connectivity, from, to) {

    const newElem = {varName, id, backupLocal, version, cid, connectivity, from, to}
    
    return newElem;
}

function hasRequiredKeys(obj) {
    const requiredKeys = ['varName', 'id', 'backupLocal', 'version', 'cid', 'connectivity', 'from', 'to'];
    return requiredKeys.every(key => obj.hasOwnProperty(key));
  }

function isGraphVariableForm (arg) {
    if (typeof arg === 'object' && arg !== null && hasRequiredKeys(arg)) {
        return true;
      } 
    return false;
}

function getStyle(id) {
    let style = 'normal';
    if (id.includes('_globalInput')) {style = 'globalInput'};
    if (id.includes('_globalOutput')) {style = 'globalOutput'};
    return style;
}

function processGraph(graphVariableArray, graphFunctionArray) {
    const nodes = [];
    const links = [];

    // console.log(`Processing graphVariableArray: ${JSON.stringify(graphVariableArray)}`);
    // console.log(`Processing graphFunctionArray: ${JSON.stringify(graphFunctionArray)}`);
  
    // Add functions to nodes
    graphFunctionArray.forEach(element => {
        nodes.push({ id: element.id, label: element.funcName, style: getStyle(element.id)});
    });
  
    // Helper function to ensure a node exists
    function ensureNodeExists(id, label = '') {
      if (!nodes.some(node => node.id === id)) {
        nodes.push({ id, label, style: getStyle(id)});
      }
    }
  
    // Process variables and add nodes and links
    graphVariableArray.forEach(variable => {

      // Process 'from' nodes, and redefine input ids if necessary
        variable.from.forEach((fromId, index) => {
            if (fromId === 'globalInput') {
                ensureNodeExists(variable.id + '_globalInput');
                variable.from[index] = variable.id + '_globalInput';
            } else {
                ensureNodeExists(fromId);
            }
        });
  
      // Process 'to' nodes, and redefine output ids if necessary
      variable.to.forEach((toId, index) => {
        if (toId === 'globalOutput') {
            ensureNodeExists(variable.id + '_globalOutput');
            variable.to[index] = variable.id + '_globalOutput';
        } else {
            ensureNodeExists(toId);
        }
      });
  
      // Add links
      variable.from.forEach(fromId => {
        variable.to.forEach(toId => {
          links.push({ source: fromId, target: toId, label: variable.varName, id: variable.id, version: variable.version });
        });
      });
    });

    // console.log(`Processed nodes: ${JSON.stringify(nodes)}`);
    // console.log(`Processed links: ${JSON.stringify(links)}`);
  
    return { nodes, links };
  }

export {newGraphVariable, isGraphVariableForm, processGraph};