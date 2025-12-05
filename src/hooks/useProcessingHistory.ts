import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProcessingRecord {
  id: string;
  input_xml: string;
  output_xml: string;
  references_found: number;
  references_renumbered: number;
  prefix: string | null;
  suffix: string | null;
  created_at: string;
}

export function useProcessingHistory() {
  const [history, setHistory] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('processing_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const saveToHistory = async (record: {
    input_xml: string;
    output_xml: string;
    references_found: number;
    references_renumbered: number;
    prefix?: string;
    suffix?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('processing_history').insert({
        user_id: user.id,
        input_xml: record.input_xml,
        output_xml: record.output_xml,
        references_found: record.references_found,
        references_renumbered: record.references_renumbered,
        prefix: record.prefix || null,
        suffix: record.suffix || null,
      });

      if (error) throw error;
      
      toast({
        title: 'Saved',
        description: 'Processing result saved to history.',
      });
      
      fetchHistory();
    } catch (error) {
      console.error('Error saving to history:', error);
      toast({
        title: 'Error',
        description: 'Failed to save to history.',
        variant: 'destructive',
      });
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('processing_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHistory((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Deleted',
        description: 'History entry removed.',
      });
    } catch (error) {
      console.error('Error deleting from history:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry.',
        variant: 'destructive',
      });
    }
  };

  return {
    history,
    loading,
    saveToHistory,
    deleteFromHistory,
    refetch: fetchHistory,
  };
}
