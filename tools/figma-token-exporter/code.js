/**
 * Takeoff Token Exporter — Figma Plugin
 *
 * Reads ALL local variable collections and variables (including all modes/themes),
 * converts them to DTCG-compatible JSON, and displays for copy/download.
 *
 * Works on ANY Figma plan — uses Plugin API, not REST API.
 */

figma.showUI(__html__, { width: 700, height: 600 });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rgbaToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0').toUpperCase()).join('');
  if (color.a !== undefined && color.a < 1) {
    const a = Math.round(color.a * 255);
    return hex + a.toString(16).padStart(2, '0').toUpperCase();
  }
  return hex;
}

function resolveValue(value, resolvedType, allVariables) {
  // Variable alias — resolve to reference path
  if (value && typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    const referencedVar = allVariables.find(v => v.id === value.id);
    if (referencedVar) {
      return { $ref: referencedVar.name };
    }
    return { $ref: 'UNKNOWN' };
  }

  // Color — convert RGBA to hex
  if (resolvedType === 'COLOR' && value && typeof value === 'object' && 'r' in value) {
    return rgbaToHex(value);
  }

  // Float — return as number
  if (resolvedType === 'FLOAT') {
    return value;
  }

  // String / Boolean — return as-is
  return value;
}

function getTypeForDTCG(resolvedType) {
  switch (resolvedType) {
    case 'COLOR':
      return 'color';
    case 'FLOAT':
      return 'number';
    case 'STRING':
      return 'string';
    case 'BOOLEAN':
      return 'boolean';
    default:
      return resolvedType.toLowerCase();
  }
}

// ---------------------------------------------------------------------------
// Main export logic
// ---------------------------------------------------------------------------

async function exportTokens() {
  const collections = figma.variables.getLocalVariableCollections();
  const allVariables = figma.variables.getLocalVariables();

  const result = {
    _meta: {
      exportedAt: new Date().toISOString(),
      fileName: figma.root.name,
      fileKey: figma.fileKey,
      totalCollections: collections.length,
      totalVariables: allVariables.length,
    },
    collections: {},
  };

  for (const collection of collections) {
    const collectionData = {
      name: collection.name,
      modes: collection.modes.map(m => ({ id: m.modeId, name: m.name })),
      defaultModeId: collection.defaultModeId,
      variables: {},
    };

    // Get variables for this collection
    const collectionVars = allVariables.filter(v => v.variableCollectionId === collection.id);

    for (const variable of collectionVars) {
      const varData = {
        name: variable.name,
        resolvedType: variable.resolvedType,
        $type: getTypeForDTCG(variable.resolvedType),
        description: variable.description || undefined,
        scopes: variable.scopes,
        valuesByMode: {},
      };

      // Get value for each mode
      for (const mode of collection.modes) {
        const rawValue = variable.valuesByMode[mode.modeId];
        const resolved = resolveValue(rawValue, variable.resolvedType, allVariables);
        varData.valuesByMode[mode.name] = resolved;
      }

      collectionData.variables[variable.name] = varData;
    }

    result.collections[collection.name] = collectionData;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Also export as flat DTCG format (per mode)
// ---------------------------------------------------------------------------

function toDTCGPerMode(exportData) {
  const output = {};

  for (const [collName, coll] of Object.entries(exportData.collections)) {
    for (const mode of coll.modes) {
      const modeKey = `${collName}/${mode.name}`;
      const tokens = {};

      for (const [varName, varData] of Object.entries(coll.variables)) {
        const value = varData.valuesByMode[mode.name];

        // Build nested DTCG structure from variable name path (e.g. "primary/500")
        const parts = varName.split('/');
        let current = tokens;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }

        const leafKey = parts[parts.length - 1];
        if (value && typeof value === 'object' && '$ref' in value) {
          // Variable alias → DTCG reference
          const refPath = value.$ref.replace(/\//g, '.');
          current[leafKey] = {
            $value: `{${refPath}}`,
            $type: varData.$type,
          };
        } else {
          current[leafKey] = {
            $value: value,
            $type: varData.$type,
          };
        }
      }

      output[modeKey] = tokens;
    }
  }

  return output;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

exportTokens()
  .then(data => {
    const dtcgPerMode = toDTCGPerMode(data);

    figma.ui.postMessage({
      type: 'EXPORT_RESULT',
      raw: data,
      dtcg: dtcgPerMode,
    });
  })
  .catch(err => {
    figma.ui.postMessage({
      type: 'ERROR',
      message: String(err),
    });
  });

figma.ui.onmessage = msg => {
  if (msg.type === 'CLOSE') {
    figma.closePlugin();
  }
};
