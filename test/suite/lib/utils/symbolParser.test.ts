import * as assert from 'assert';
import * as vscode from 'vscode';

import { SymbolParser } from '@src/lib/utils';
import { AssertionError } from 'assert';

const suiteName = 'SymbolParser test suite';

suite(suiteName, () => {
	vscode.window.showInformationMessage(`Starting ${suiteName}...`);

    test('findFirstNonVarDefnLine: non var defns exist', async () => {
        const testData: vscode.SymbolInformation[] = JSON.parse(`[
            {
                "name": "stringVar : String",
                "kind": 8,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 1,
                            "character": 18
                        },
                        "end": {
                            "line": 1,
                            "character": 27
                        }
                    }
                }
            },
            {
                "name": "something() : String",
                "kind": 6,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 3,
                            "character": 18
                        },
                        "end": {
                            "line": 3,
                            "character": 27
                        }
                    }
                }
            },
            {
                "name": "Test",
                "kind": 5,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 0,
                            "character": 13
                        },
                        "end": {
                            "line": 0,
                            "character": 17
                        }
                    }
                }
            }
        ]`);
        const result = SymbolParser.findFirstNonVarDefnLine(testData);
        assert.equal(result, 3, 'A different linenumber expected for first non-var definition when a method exists');
    });

    test('findFirstNonVarDefnLine: non var defns do not exist', async () => {
        const testData: vscode.SymbolInformation[] = JSON.parse(`[
            {
                "name": "stringVar : String",
                "kind": 8,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 1,
                            "character": 18
                        },
                        "end": {
                            "line": 1,
                            "character": 27
                        }
                    }
                }
            },
            {
                "name": "Test",
                "kind": 5,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 0,
                            "character": 13
                        },
                        "end": {
                            "line": 0,
                            "character": 17
                        }
                    }
                }
            }
        ]`);
        const result = SymbolParser.findFirstNonVarDefnLine(testData);
        assert.equal(result, 2, 'A different linenumber expected for first non-var definition only vars exist');
    });

    test('findFirstNonVarDefnLine: non var defns do not exist for inner class', async () => {
        const testData: vscode.SymbolInformation[] = JSON.parse(`[
            {
                "name": "stringVar : String",
                "kind": 8,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 6,
                            "character": 18
                        },
                        "end": {
                            "line": 6,
                            "character": 27
                        }
                    }
                }
            },
            {
                "name": "Test",
                "kind": 5,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 5,
                            "character": 13
                        },
                        "end": {
                            "line": 5,
                            "character": 17
                        }
                    }
                }
            }
        ]`);
        const result = SymbolParser.findFirstNonVarDefnLine(testData);
        assert.equal(result, 7, 'A different linenumber expected for first non-var definition only vars exist');
    });

    test('findFirstNonVarDefnLine: empty class', async () => {
        const testData: vscode.SymbolInformation[] = JSON.parse(`[
            {
                "name": "Test",
                "kind": 5,
                "location": {
                    "uri": "file:///Users/nchursin/Documents/Projects/apex-intention-actions/src/test/suite/lib/lineType/data/PositionTests/NonVarPositions/Test4/Class.cls",
                    "range": {
                        "start": {
                            "line": 0,
                            "character": 13
                        },
                        "end": {
                            "line": 0,
                            "character": 17
                        }
                    }
                }
            }
        ]`);
        const result = SymbolParser.findFirstNonVarDefnLine(testData);
        assert.equal(result, 1, 'A different linenumber expected for empty class');
    });
});
