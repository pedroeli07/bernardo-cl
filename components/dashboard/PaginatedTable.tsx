import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SortAsc, SortDesc, List, MoreHorizontal, ChevronDown } from 'lucide-react';
import { BernardoPerformanceData } from '@/lib/mock-data';
import { formatCurrency, formatDateRange, formatDateRanges, parseNumber } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '../ui/button';

interface PaginatedTableProps {
  data: BernardoPerformanceData[];
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function PaginatedTable({ data, sortField, sortDirection, onSort }: PaginatedTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current && headerRef.current) {
        const tableTop = tableRef.current.getBoundingClientRect().top;
        setIsHeaderSticky(tableTop < 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Reset to page 1 when items per page changes
    setCurrentPage(1);
  }, [itemsPerPage]);
  
  // Calculate total pages
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(data.length / itemsPerPage);
  
  // Get current page data
  const getCurrentItems = () => {
    if (itemsPerPage === -1) return data; // Show all items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  const currentItems = getCurrentItems();
  
  // For display in the footer
  const indexOfFirstItem = itemsPerPage === -1 ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = itemsPerPage === -1 ? data.length : Math.min(currentPage * itemsPerPage, data.length);
  
  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  const tableHeaderClass = isHeaderSticky ? 
    "sticky top-0 z-10 bg-black shadow-md transition-all duration-300" : 
    "transition-all duration-300";

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Total: {data.length} resultados</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Linhas por página:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(val) => setItemsPerPage(parseInt(val))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="-1">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div 
        ref={tableRef} 
        className="overflow-x-auto rounded-lg border border-gray-800 relative shadow-xl"
        style={{ maxHeight: '600px', overflowY: 'auto' }}
      >
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <Table>
            <TableHeader ref={headerRef} className={tableHeaderClass}>
              <TableRow className="bg-gradient-to-r from-zinc-900 to-slate-900">
                <TableHead onClick={() => onSort('dateRange')} className="cursor-pointer text-lg font-bold text-[#FFB612] py-4 min-w-[140px]">
                  <div className="flex items-center gap-1 hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    Período {sortField === 'dateRange' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('buyInRange')} className="cursor-pointer text-lg font-bold text-[#FFB612] py-4 min-w-[120px]">
                  <div className="flex items-center gap-1 hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    Buy-in {sortField === 'buyInRange' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('count')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    Torneios {sortField === 'count' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('profit')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    Profit {sortField === 'profit' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('avgProfit')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    Profit Médio {sortField === 'avgProfit' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('totalROI')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    ROI Total {sortField === 'totalROI' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('avgROI')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    ROI Médio {sortField === 'avgROI' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('itm')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    ITM {sortField === 'itm' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
                <TableHead onClick={() => onSort('finalTables')} className="cursor-pointer text-right text-lg font-bold text-[#FFB612] py-4">
                  <div className="flex items-center gap-1 justify-end hover:bg-zinc-800/50 p-2 rounded transition-colors">
                    Mesas Finais {sortField === 'finalTables' && (sortDirection === 'asc' ? <SortAsc className="inline h-5 w-5" /> : <SortDesc className="inline h-5 w-5" />)}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => {
                const badges = [
                  { value: formatDateRanges(item.dateRange), variant: "outline", className: "bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800" },
                  { value: item.buyInRange || '-', variant: "outline", className: "bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800" },
                  { value: item.count, variant: "secondary", className: "bg-slate-800 text-slate-100" },
                  { 
                    value: typeof item.profit === 'number' ? formatCurrency(item.profit) : item.profit,
                    variant: "outline",
                    className: `${(typeof item.profit === 'number' ? item.profit : parseNumber(item.profit)) >= 0 
                      ? 'bg-green-900/20 text-green-400 border-green-800' 
                      : 'bg-red-900/20 text-red-400 border-red-800'} hover:bg-opacity-30 transition-colors`
                  },
                  {
                    value: typeof item.avgProfit === 'number' ? formatCurrency(item.avgProfit) : item.avgProfit,
                    variant: "outline", 
                    className: `${(typeof item.avgProfit === 'number' ? item.avgProfit : parseNumber(item.avgProfit)) >= 0
                      ? 'bg-green-900/20 text-green-400 border-green-800'
                      : 'bg-red-900/20 text-red-400 border-red-800'} hover:bg-opacity-30 transition-colors`
                  },
                  {
                    value: item.totalROI,
                    variant: "outline",
                    className: `${parseNumber(item.totalROI) >= 0
                      ? 'bg-green-900/20 text-green-400 border-green-800'
                      : 'bg-red-900/20 text-red-400 border-red-800'} hover:bg-opacity-30 transition-colors`
                  },
                  {
                    value: item.avgROI,
                    variant: "outline",
                    className: `${parseNumber(item.avgROI) >= 0
                      ? 'bg-green-900/20 text-green-400 border-green-800'
                      : 'bg-red-900/20 text-red-400 border-red-800'} hover:bg-opacity-30 transition-colors`
                  },
                  { value: item.itm, variant: "secondary", className: "bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-900/30" },
                  { value: item.finalTables, variant: "secondary", className: "bg-purple-900/20 text-purple-400 border-purple-800 hover:bg-purple-900/30" }
                ];

                return (
                  <motion.tr
                    key={index}
                    variants={rowVariants}
                    className="group hover:bg-zinc-900/60 transition-colors"
                  >
                    {badges.map((badge, i) => (
                      <TableCell key={i} className={`${i > 1 ? "text-right" : ""} p-2`}>
                        <Badge 
                          variant={badge.variant as any}
                          className={`${badge.className} text-base px-4 py-1 group-hover:scale-105 transition-transform`}
                        >
                          {badge.value}
                        </Badge>
                      </TableCell>
                    ))}
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      </div>
      
      {/* Não mostrar paginação se estiver mostrando todos os items */}
      {itemsPerPage !== -1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Mostrando {indexOfFirstItem}-{indexOfLastItem} de {data.length} resultados
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <PaginationPrevious className="h-4 w-4" />
                  <span>Anterior</span>
                </Button>
              </PaginationItem>
              
              {/* Páginas para desktop */}
              <div className="hidden md:flex">
                {startPage > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
                    </PaginationItem>
                    {startPage > 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}
                
                {pageNumbers.map(number => (
                  <PaginationItem key={number}>
                    <PaginationLink 
                      isActive={currentPage === number}
                      onClick={() => goToPage(number)}
                      className={currentPage === number ? "bg-[#FFB612] text-black font-medium" : ""}
                    >
                      {number}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
              </div>
              
              {/* Dropdown para mobile */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <span>Página {currentPage} de {totalPages}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 max-h-[300px] overflow-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <DropdownMenuItem 
                        key={page}
                        className={currentPage === page ? "bg-[#FFB612]/20 font-medium" : ""}
                        onClick={() => goToPage(page)}
                      >
                        Página {page}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <PaginationItem>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  <span>Próxima</span>
                  <PaginationNext className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default PaginatedTable; 