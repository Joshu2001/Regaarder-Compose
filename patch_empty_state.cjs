const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                            {dataPortalImports.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Recent imports</p>
                                  <button type="button" className="text-[12px] text-violet-600 hover:underline font-medium">View all</button>
                                </div>`;

const replacement = `                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Recent imports</p>
                                {dataPortalImports.length > 0 && <button type="button" className="text-[12px] text-violet-600 hover:underline font-medium">View all</button>}
                            </div>
                            {dataPortalImports.length > 0 ? (
                              <div>`;

code = code.replace(target, replacement);

const endTarget = `                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ) : (`;

const endReplacement = `                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 px-6 bg-white/50 rounded-2xl border border-gray-100/50 border-dashed">
                                <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-3 shadow-sm ring-4 ring-violet-50/50">
                                  <FolderOpen size={20} />
                                </div>
                                <h3 className="text-[14px] font-semibold text-slate-800 mb-1">No recent imports</h3>
                                <p className="text-[12px] text-slate-500 text-center max-w-[240px] leading-relaxed">Your imported datasets, spreadsheets, and media will appear here.</p>
                              </div>
                            )}

                          </div>
                        </div>
                      ) : (`;

code = code.replace(endTarget, endReplacement);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Done');
