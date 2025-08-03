'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const formSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  departure_location: z.string().min(5, 'Le lieu de départ est requis'),
  destination: z.string().min(5, 'La destination est requise'),
  departure_date: z.date({ required_error: 'La date de départ est requise' }),
  departure_time: z.string().min(1, 'L\'heure de départ est requise'),
  return_date: z.date().optional(),
  return_time: z.string().optional(),
  passenger_count: z.number().min(1, 'Le nombre de passagers doit être supérieur à 0'),
  client_name: z.string().min(2, 'Le nom du client est requis'),
  client_phone: z.string().min(10, 'Le téléphone du client est requis'),
  client_email: z.string().email('Email invalide').optional().or(z.literal('')),
  special_instructions: z.string().optional(),
  estimated_cost: z.number().min(0, 'Le coût estimé ne peut pas être négatif').optional(),
})

export function CreateMissionModal({ open, onOpenChange, onSave }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      departure_location: '',
      destination: '',
      departure_time: '',
      return_time: '',
      passenger_count: 1,
      client_name: '',
      client_phone: '',
      client_email: '',
      special_instructions: '',
      estimated_cost: 0,
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Combine date and time for departure
      const [depHours, depMinutes] = data.departure_time.split(':')
      const departureDate = new Date(data.departure_date)
      departureDate.setHours(parseInt(depHours), parseInt(depMinutes), 0, 0)

      // Combine date and time for return if provided
      let returnDate = null
      if (data.return_date && data.return_time) {
        const [retHours, retMinutes] = data.return_time.split(':')
        returnDate = new Date(data.return_date)
        returnDate.setHours(parseInt(retHours), parseInt(retMinutes), 0, 0)
      }

      const missionData = {
        title: data.title,
        departure_location: data.departure_location,
        destination: data.destination,
        departure_date: departureDate.toISOString(),
        return_date: returnDate?.toISOString() || null,
        passenger_count: data.passenger_count,
        client_name: data.client_name,
        client_phone: data.client_phone,
        client_email: data.client_email || null,
        special_instructions: data.special_instructions || null,
        estimated_cost: data.estimated_cost || null,
      }

      await onSave(missionData)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error creating mission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle mission</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle mission de transport à votre planning
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Mission Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la mission</FormLabel>
                  <FormControl>
                    <Input placeholder="Transport scolaire Lyon - Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Departure and Destination */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de départ</FormLabel>
                    <FormControl>
                      <Input placeholder="Lyon, Place Bellecour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Paris, Gare de Lyon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Departure Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de départ</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departure_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de départ</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Return Date and Time (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="return_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de retour (optionnel)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="return_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de retour (optionnel)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passenger Count and Estimated Cost */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passenger_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de passagers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="45" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coût estimé (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="1250.00" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Informations client</h4>
              
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du client</FormLabel>
                    <FormControl>
                      <Input placeholder="Lycée Jean Moulin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="04 78 12 34 56" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="contact@lycee-moulin.fr" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Special Instructions */}
            <FormField
              control={form.control}
              name="special_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions spéciales (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Arrêt prévu à Mâcon pour pause déjeuner..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Créer la mission
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}