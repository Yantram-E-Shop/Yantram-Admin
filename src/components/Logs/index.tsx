"use client";

import React, { useContext, useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import api from "@/api/axios";
import { AuthContext } from "@/context/AuthContext";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LogLevel = "" | "info" | "warn" | "error" | "debug";

interface LogDate {
    date: string;
    sizeBytes: number;
}

interface LogEntry {
    timestamp: string | null;
    level: string;
    message: unknown[];
}

interface LogsResponse {
    date: string;
    total: number;
    limit: number;
    offset: number;
    logs: LogEntry[];
}

const PAGE_SIZE = 50;

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatMessage = (message: unknown[]) =>
    message.map((part) => {
        if (typeof part === "string") return part;
        if (part === undefined) return "undefined";
        try {
            return JSON.stringify(part);
        } catch {
            return String(part);
        }
    }).join(" ");

const levelStyles: Record<string, string> = {
    info: "bg-blue-500/15 text-blue-400",
    warn: "bg-yellow-500/15 text-yellow-400",
    error: "bg-red-500/15 text-red-400",
    debug: "bg-purple-500/15 text-purple-400",
};

const Logs = () => {
    const authContext = useContext(AuthContext);
    const accessToken = authContext?.accessToken;
    const [dates, setDates] = useState<LogDate[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [level, setLevel] = useState<LogLevel>("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [logs, setLogs] = useState<LogsResponse | null>(null);
    const [offset, setOffset] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!accessToken) return;

        const fetchDates = async () => {
            try {
                const response = await api.get("/logs/dates");
                const availableDates = response.data.data as LogDate[];
                setDates(availableDates);
                setSelectedDate((current) =>
                    current && availableDates.some((item) => item.date === current)
                        ? current
                        : availableDates[0]?.date ?? ""
                );
            } catch (fetchError) {
                console.error("Error fetching log dates:", fetchError);
                setError("Unable to load backend log files.");
                setLoading(false);
            }
        };

        fetchDates();
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken || !selectedDate) {
            setLoading(false);
            return;
        }

        const fetchLogs = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get("/logs", {
                    params: {
                        date: selectedDate,
                        level: level || undefined,
                        search: search || undefined,
                        limit: PAGE_SIZE,
                        offset,
                    },
                });
                setLogs(response.data.data);
            } catch (fetchError) {
                console.error("Error fetching backend logs:", fetchError);
                setError("Unable to fetch logs for the selected filters.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [accessToken, selectedDate, level, search, offset, refreshKey]);

    const applySearch = () => {
        setOffset(0);
        setSearch(searchInput.trim());
    };

    const selectDate = (date: string) => {
        setSelectedDate(date);
        setOffset(0);
    };

    const changeLevel = (nextLevel: LogLevel) => {
        setLevel(nextLevel);
        setOffset(0);
    };

    const refresh = () => {
        setLogs(null);
        setRefreshKey((current) => current + 1);
    };

    const maxOffset = logs ? Math.max(0, Math.floor((logs.total - 1) / PAGE_SIZE) * PAGE_SIZE) : 0;

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Backend logs</h1>
                <p className="text-sm text-muted-foreground">
                    Inspect server activity, warnings, and errors.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
                <label className="space-y-1">
                    <span className="text-sm font-medium">Log date</span>
                    <select
                        value={selectedDate}
                        onChange={(event) => selectDate(event.target.value)}
                        className="flex h-10 min-w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        {dates.length === 0 && <option value="">No log files</option>}
                        {dates.map((item) => (
                            <option value={item.date} key={item.date}>
                                {item.date} ({formatBytes(item.sizeBytes)})
                            </option>
                        ))}
                    </select>
                </label>

                <label className="space-y-1">
                    <span className="text-sm font-medium">Level</span>
                    <select
                        value={level}
                        onChange={(event) => changeLevel(event.target.value as LogLevel)}
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">All levels</option>
                        <option value="info">Info</option>
                        <option value="warn">Warning</option>
                        <option value="error">Error</option>
                        <option value="debug">Debug</option>
                    </select>
                </label>

                <label className="space-y-1">
                    <span className="text-sm font-medium">Search</span>
                    <div className="flex gap-2">
                        <Input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") applySearch();
                            }}
                            placeholder="Search log entries"
                            className="w-64"
                        />
                        <Button type="button" onClick={applySearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                </label>

                <Button type="button" variant="outline" onClick={refresh} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {loading && <Loader />}

            {!loading && logs && (
                <>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{logs.total} matching entries</span>
                        <span>
                            {logs.total === 0 ? 0 : offset + 1}-{Math.min(offset + PAGE_SIZE, logs.total)}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {logs.logs.map((entry, index) => (
                            <article key={`${entry.timestamp ?? "unknown"}-${offset}-${index}`} className="rounded-lg border bg-card p-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`rounded px-2 py-1 text-xs font-semibold uppercase ${levelStyles[entry.level] ?? "bg-muted text-muted-foreground"}`}>
                                        {entry.level}
                                    </span>
                                    <time className="text-xs text-muted-foreground">
                                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "Unknown time"}
                                    </time>
                                </div>
                                <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                                    {formatMessage(Array.isArray(entry.message) ? entry.message : [entry.message])}
                                </pre>
                            </article>
                        ))}
                        {logs.logs.length === 0 && (
                            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                                No log entries match the selected filters.
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={offset === 0}
                            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={offset >= maxOffset}
                            onClick={() => setOffset(Math.min(maxOffset, offset + PAGE_SIZE))}
                        >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Logs;
