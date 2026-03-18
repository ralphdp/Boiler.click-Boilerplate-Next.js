"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

interface Column {
    id: string;
    header: string;
    width?: string;
    render?: (row: any) => React.ReactNode;
}

export function DataGrid({
    data,
    columns,
    searchable = true,
    itemsPerPage = 10
}: {
    data: any[],
    columns: Column[],
    searchable?: boolean,
    itemsPerPage?: number,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const filteredData = data.filter((row) =>
        Object.values(row).some(
            (val) => String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="w-full border border-white/10 bg-black/50 backdrop-blur-md rounded-lg overflow-hidden shadow-xl text-sm font-sans flex flex-col">

            {/* Toolbar */}
            {searchable && (
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                    <div className="relative w-64 max-w-full">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                        <input
                            placeholder="Search records..."
                            className="bg-black/50 border border-white/10 rounded-md pl-9 pr-4 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-xs transition-colors"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs uppercase tracking-wider text-[var(--accent)] font-mono border border-[var(--accent)]/30 px-3 py-1.5 rounded-sm bg-[var(--accent)]/10">
                            {filteredData.length} Records
                        </span>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto admin-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap table-auto min-w-[800px]">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    className="p-4 text-xs font-mono uppercase tracking-widest text-white/60 font-semibold"
                                    style={{ width: col.width }}
                                >
                                    {col.header}
                                </th>
                            ))}
                            <th className="p-4 w-12 text-center text-xs text-white/60">
                                <MoreVertical className="w-4 h-4 mx-auto opacity-50" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, i) => (
                                <tr
                                    key={row.id || i}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                >
                                    {columns.map((col) => (
                                        <td key={col.id} className="p-4 font-mono text-sm opacity-90">
                                            {col.render ? col.render(row) : row[col.id]}
                                        </td>
                                    ))}
                                    <td className="p-4 text-center">
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all">
                                            <MoreVertical className="w-4 h-4 text-white/50 hover:text-white" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-8 text-center text-white/40 italic font-mono text-xs uppercase tracking-widest">
                                    [No Data Found in Current Manifold]
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-3 border-t border-white/10 bg-black/60 text-xs">
                    <span className="text-white/40 font-mono tracking-widest uppercase ml-2">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border border-white/5"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border border-white/5"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
