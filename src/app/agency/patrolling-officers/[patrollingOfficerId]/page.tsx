
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Incident, Guard, Site, Organization, PatrollingOfficer } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, FileDown, Phone, Mail, MapPin, Users, ShieldAlert, Map, Clock, ChevronDown, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState, useRef, Fragment, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

type PaginatedIncidents = {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        id: number;
        incident_id: string;
        tb_site_id: string;
        incident_time: string;
        incident_status: "Active" | "Under Review" | "Resolved";
        site_name: string;
        guard_name: string;
        patrol_officer_name: string;
    }[];
};

type OfficerReportData = {
    id: number;
    employee_id: string;
    profile_picture: string | null;
    first_name: string;
    last_name: string | null;
    phone: string;
    email: string;
    total_guards: number;
    total_sites: number;
    total_incidents: number;
    average_response_time: string;
    site_visit_accuracy: string;
    assigned_sites: {
        id: number;
        tb_site_id: string;
        org_site_id: string;
        site_name: string;
        address: string;
        total_incidents: number;
        resolved_incidents: number;
        guards_count: number;
        guards: {
            id: number;
            employee_id: string;
            first_name: string;
            last_name: string | null;
            phone: string;
        }[];
    }[];
    incidents: PaginatedIncidents | null;
};


const getPerformanceColor = (value: number) => {
  if (value >= 95) {
    return 'hsl(var(--chart-2))'; // Green
  } else if (value >= 65) {
    return 'hsl(var(--chart-3))'; // Yellow
  } else {
    return 'hsl(var(--destructive))'; // Orange
  }
};

export default function AgencyPatrollingOfficerReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patrollingOfficerId = params.patrollingOfficerId as string;
  
  const [reportData, setReportData] = useState<OfficerReportData | null>(null);
  const [paginatedIncidents, setPaginatedIncidents] = useState<PaginatedIncidents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIncidentsLoading, setIsIncidentsLoading] = useState(false);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [performanceSelectedYear, setPerformanceSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [performanceSelectedMonth, setPerformanceSelectedMonth] = useState<string>('all');
  const [expandedSiteId, setExpandedSiteId] = useState<number | null>(null);

  const incidentsTableRef = useRef<HTMLDivElement>(null);
  const assignedSitesTableRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        if (orgData) {
            setLoggedInOrg(JSON.parse(orgData));
        }
    }
  }, []);

  const fetchReportData = useCallback(async (url: string, isFiltering: boolean = false) => {
    if (isFiltering) {
      setIsIncidentsLoading(true);
    } else {
      setIsLoading(true);
    }
    const token = localStorage.getItem('token') || undefined;

    try {
        const data = await fetchData<OfficerReportData>(url, token);
        if (isFiltering) {
            setPaginatedIncidents(data?.incidents || null);
        } else {
            setReportData(data);
            setPaginatedIncidents(data?.incidents || null);
        }
    } catch (error) {
        console.error("Failed to fetch officer report:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load patrolling officer report."});
    } finally {
        if (isFiltering) {
          setIsIncidentsLoading(false);
        } else {
          setIsLoading(false);
        }
    }
  }, [toast]);
  
  useEffect(() => {
    if (loggedInOrg && patrollingOfficerId) {
      const baseUrl = `/agency/${loggedInOrg.code}/patrol_officer/${patrollingOfficerId}/`;
      const params = new URLSearchParams();

      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedMonth !== 'all' && selectedMonth !== 'all') params.append('month', (parseInt(selectedMonth) + 1).toString());
      if (selectedStatus !== 'all') {
        let apiStatus = '';
        if (selectedStatus === 'under-review') {
          apiStatus = 'Under Review';
        } else {
          apiStatus = selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);
        }
        params.append('incident_status', apiStatus);
      }
      
      const fullUrl = `${baseUrl}?${params.toString()}`;
      fetchReportData(fullUrl, false);
    }
  }, [loggedInOrg, patrollingOfficerId, selectedYear, selectedMonth, selectedStatus, fetchReportData]);

  const handleIncidentPagination = useCallback(async (url: string | null) => {
      if (!url) return;
      setIsIncidentsLoading(true);
      const token = localStorage.getItem('token') || undefined;
      try {
        const data = await fetchData<{incidents: PaginatedIncidents}>(url, token);
        setPaginatedIncidents(data?.incidents || null);
      } catch (error) {
        console.error("Failed to fetch paginated incidents:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load next page of incidents.' });
      } finally {
        setIsIncidentsLoading(false);
      }
  }, [toast]);

  const availableYears = useMemo(() => {
    if (!reportData || !reportData.incidents) return [];
    const years = new Set(
      reportData.incidents.results.map((incident) => new Date(incident.incident_time).getFullYear().toString())
    );
    if (years.size > 0 || !years.has(new Date().getFullYear().toString())) {
        years.add(new Date().getFullYear().toString());
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [reportData]);
  
  const performanceAvailableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const siteVisitAccuracy = parseFloat(reportData?.site_visit_accuracy || '0');
  const averageResponseTime = reportData?.average_response_time || '0 mins';
  
  const roundedSiteVisitAccuracy = Math.round(siteVisitAccuracy);
  const siteVisitColor = getPerformanceColor(roundedSiteVisitAccuracy);

  const siteVisitAccuracyData = [
    { name: 'Accuracy', value: roundedSiteVisitAccuracy },
    { name: 'Remaining', value: 100 - roundedSiteVisitAccuracy },
  ];
  const COLORS_SITE_VISIT = [siteVisitColor, 'hsl(var(--muted))'];

  if (isLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 lg:col-span-1" />
                <Skeleton className="h-64 lg:col-span-2" />
            </div>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Patrolling Officer not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const officerName = `${reportData.first_name} ${reportData.last_name || ''}`.trim();

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${officerName}.`,
    });
  };

  const handleScrollToIncidents = () => {
    const element = incidentsTableRef.current;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('highlight-row');
        setTimeout(() => {
            element.classList.remove('highlight-row');
        }, 2000);
    }
  };

  const handleScrollToAssignedSites = () => {
    const element = assignedSitesTableRef.current;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('highlight-row');
        setTimeout(() => {
            element.classList.remove('highlight-row');
        }, 2000);
    }
  };
  
  const handleExpandClick = (e: React.MouseEvent, siteId: number) => {
    e.stopPropagation();
    setExpandedSiteId(prevId => prevId === siteId ? null : siteId);
  }

  const getStatusIndicator = (status: "Active" | "Under Review" | "Resolved") => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
            </span>
            <span>{status}</span>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/agency/patrolling-officers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Patrolling Officers</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Report</h1>
            <p className="text-muted-foreground font-medium">Detailed overview for ${officerName}.</p>
          </div>
        </div>
        <Button onClick={handleDownloadReport} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 w-56">
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
              <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={reportData.profile_picture || undefined} alt={officerName} />
                        <AvatarFallback>{officerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">${officerName}</CardTitle>
                        <p className="font-medium text-foreground">ID: ${reportData.employee_id}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm mt-2 space-y-2">
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 mt-1 text-primary" />
                        <a href={`tel:${reportData.phone}`} className="hover:underline font-medium">{reportData.phone}</a>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 mt-1 text-primary" />
                        <a href={`mailto:${reportData.email}`} className="hover:underline font-medium">{reportData.email}</a>
                      </div>
                    </div>
                     <div className="pt-4 mt-4 border-t">
                      <h4 className="font-semibold mb-4 text-lg">Operational Overview</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div className="flex flex-col items-center gap-1">
                              <Users className="h-8 w-8 text-primary" />
                              <p className="font-medium text-muted-foreground">Total Guards</p>
                              <p className="font-bold text-lg">{reportData.total_guards}</p>
                          </div>
                          <button
                            onClick={handleScrollToAssignedSites}
                            className="flex flex-col items-center gap-1 group"
                          >
                              <Building2 className="h-8 w-8 text-primary" />
                              <p className="font-medium text-[#00B4D8] group-hover:underline">Total Sites</p>
                              <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{reportData.total_sites}</p>
                          </button>
                          <button
                            onClick={handleScrollToIncidents}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <ShieldAlert className="h-8 w-8 text-primary" />
                            <p className="font-medium text-[#00B4D8] group-hover:underline">Total Incidents</p>
                            <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{reportData.total_incidents}</p>
                          </button>
                        </div>
                    </div>
                  </CardContent>
              </Card>
          </div>
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Patrolling Officer Performance</CardTitle>
                    <CardDescription className="font-medium">
                        Key performance indicators for this patrolling officer.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={performanceSelectedYear} onValueChange={setPerformanceSelectedYear}>
                        <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                        {performanceAvailableYears.map((year) => (
                            <SelectItem key={year} value={year} className="font-medium">
                            {year}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <Select value={performanceSelectedMonth} onValueChange={setPerformanceSelectedMonth}>
                        <SelectTrigger className="w-[140px] font-medium hover:bg-accent hover:text-accent-foreground">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all" className="font-medium">All Months</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()} className="font-medium">
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center pt-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-40 h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={siteVisitAccuracyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="85%"
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {siteVisitAccuracyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_SITE_VISIT[index % COLORS_SITE_VISIT.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold" style={{ color: siteVisitColor }}>
                                {roundedSiteVisitAccuracy}%
                            </span>
                        </div>
                    </div>
                    <p className="flex items-center gap-2 text-center font-medium">
                    <Map className="w-4 h-4 text-primary" />
                    Site Visit Accuracy
                    </p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 text-foreground">
                        <Clock className="w-12 h-12 text-primary" />
                        <div>
                            <span className="text-4xl font-bold">{averageResponseTime.split(' ')[0]}</span>
                            <span className="text-lg text-muted-foreground ml-1">{averageResponseTime.split(' ')[1]}</span>
                        </div>
                    </div>
                    <p className="text-center font-medium mt-2">
                        Average Response Time
                    </p>
                </div>
            </CardContent>
          </Card>
      </div>

      <Card ref={assignedSitesTableRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/>Assigned Sites</CardTitle>
          <CardDescription className="font-medium">A detailed list of all sites assigned to ${officerName}.</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.assigned_sites.length > 0 ? (
              <ScrollArea className="h-72">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Towerbuddy ID</TableHead>
                            <TableHead>Site ID</TableHead>
                            <TableHead>Site Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Guards</TableHead>
                            <TableHead>Incidents</TableHead>
                            <TableHead>Resolved</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.assigned_sites.map(site => {
                            const isExpanded = expandedSiteId === site.id;

                            return (
                              <Fragment key={site.id}>
                                <TableRow className="hover:bg-accent hover:text-accent-foreground group">
                                    <TableCell>
                                      <Button asChild variant="link" className="p-0 h-auto text-accent font-semibold group-hover:text-accent-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/agency/sites/${site.id}`}>{site.tb_site_id}</Link>
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{site.org_site_id}</span>
                                    </TableCell>
                                    <TableCell className="font-medium">{site.site_name}</TableCell>
                                    <TableCell className="font-medium">{site.address}</TableCell>
                                    <TableCell>
                                       <Button
                                        variant="link"
                                        className="p-0 h-auto flex items-center gap-2 text-accent group-hover:text-accent-foreground"
                                        onClick={(e) => handleExpandClick(e, site.id)}
                                        disabled={site.guards_count === 0}
                                      >
                                        <Users className="h-4 w-4" />
                                        {site.guards_count}
                                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2 font-medium">
                                        <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                        <span>{site.total_incidents}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2 font-medium">
                                        <CheckCircle className="h-4 w-4 text-chart-2" />
                                        <span>{site.resolved_incidents}</span>
                                      </div>
                                    </TableCell>
                                </TableRow>
                                {isExpanded && (
                                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                                      <TableCell colSpan={7} className="p-0">
                                          <div className="p-4">
                                              <Table>
                                                  <TableHeader>
                                                      <TableRow className="border-b-primary/20 hover:bg-transparent">
                                                          <TableHead className="text-foreground">Guard ID</TableHead>
                                                          <TableHead className="text-foreground">Guard Name</TableHead>
                                                          <TableHead className="text-foreground">Contact</TableHead>
                                                      </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                      {site.guards.map(guard => (
                                                          <TableRow key={guard.id} className="hover:bg-accent hover:text-accent-foreground group cursor-pointer" onClick={() => router.push(`/agency/guards/${guard.id}`)}>
                                                              <TableCell>
                                                                  <Button asChild variant="link" className="p-0 h-auto text-sm font-medium text-accent group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                                                    <Link href={`/agency/guards/${guard.id}`}>{guard.employee_id}</Link>
                                                                  </Button>
                                                              </TableCell>
                                                              <TableCell>
                                                                  <div className="flex items-center gap-3">
                                                                      <p className="font-semibold">{`${guard.first_name} ${guard.last_name || ''}`}</p>
                                                                  </div>
                                                              </TableCell>
                                                              <TableCell>
                                                                  <div className="flex items-center gap-2">
                                                                      <Phone className="h-4 w-4" />
                                                                      <a href={`tel:${guard.phone}`} className="hover:underline font-medium">{guard.phone}</a>
                                                                  </div>
                                                              </TableCell>
                                                          </TableRow>
                                                      ))}
                                                  </TableBody>
                                              </Table>
                                          </div>
                                      </TableCell>
                                  </TableRow>
                                )}
                              </Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
              </ScrollArea>
          ) : (
              <p className="text-sm text-muted-foreground text-center py-4 font-medium">No sites are assigned to this patrolling officer.</p>
          )}
        </CardContent>
      </Card>
      
      <Card ref={incidentsTableRef}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-grow">
            <CardTitle>Incidents Log</CardTitle>
            <CardDescription className="font-medium">A log of emergency incidents at sites managed by ${officerName}.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
             <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
                    <SelectItem value="active" className="font-medium">Active</SelectItem>
                    <SelectItem value="under-review" className="font-medium">Under Review</SelectItem>
                    <SelectItem value="resolved" className="font-medium">Resolved</SelectItem>
                </SelectContent>
            </Select>
            {availableYears.length > 0 && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] font-medium">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year} className="font-medium">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] font-medium">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()} className="font-medium">
                    {new Date(0, i).toLocaleString('default', {
                      month: 'long',
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
           {isIncidentsLoading ? (
            <div className="flex items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : paginatedIncidents && paginatedIncidents.results.length > 0 ? (
            <ScrollArea className="h-72">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident ID</TableHead>
                      <TableHead>Incident Date</TableHead>
                      <TableHead>Incident Time</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Guard</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedIncidents.results.map((incident) => {
                        return (
                            <TableRow 
                              key={incident.id}
                              onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                              className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                            >
                                <TableCell>
                                  <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/agency/incidents/${incident.id}`}>{incident.incident_id}</Link>
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">{new Date(incident.incident_time).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{new Date(incident.incident_time).toLocaleTimeString()}</TableCell>
                                <TableCell className="font-medium">{incident.site_name || 'N/A'}</TableCell>
                                <TableCell className="font-medium">{incident.guard_name || 'N/A'}</TableCell>
                                <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                            </TableRow>
                        )
                    })}
                  </TableBody>
                </Table>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">No recent incidents for this patrolling officer's sites {selectedYear !== 'all' || selectedMonth !== 'all' ? 'in the selected period' : ''}.</p>
          )}
        </CardContent>
         {paginatedIncidents && paginatedIncidents.count > 0 && !isIncidentsLoading && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground font-medium">
                  Showing ${paginatedIncidents.results.length} of ${paginatedIncidents.count} incidents.
              </div>
              <div className="flex items-center gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncidentPagination(paginatedIncidents.previous)}
                      disabled={!paginatedIncidents.previous}
                      className="w-20"
                  >
                      Previous
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncidentPagination(paginatedIncidents.next)}
                      disabled={!paginatedIncidents.next}
                      className="w-20"
                  >
                      Next
                  </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
