/**
 * ✅ CORRECTION CRITIQUE 2.1: Dictionnaire Linguistique Unifié FERDI
 * Centralisation de tous les textes français + terminologie autocaristes
 * GAIN: Cohérence brand + maintenance centralisée + SEO français optimisé
 */

export const UI_TEXTS_FR = {
  // Navigation & Actions
  nav: {
    openMenu: 'Ouvrir le menu de navigation',
    closeMenu: 'Fermer le menu de navigation', 
    dashboard: 'Tableau de bord',
    profile: 'Mon profil',
    logout: 'Se déconnecter',
    settings: 'Paramètres'
  },
  
  actions: {
    save: 'Enregistrer',
    cancel: 'Annuler', 
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Afficher',
    create: 'Créer',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    send: 'Envoyer',
    resend: 'Renvoyer',
    invite: 'Inviter',
    reset: 'Réinitialiser'
  },
  
  // Status & States
  status: {
    active: 'Actif',
    inactive: 'Inactif', 
    pending: 'En attente',
    expired: 'Expiré',
    deleted: 'Supprimé',
    locked: 'Bloqué',
    accepted: 'Accepté',
    cancelled: 'Annulé'
  },
  
  // Messages  
  messages: {
    loading: 'Chargement en cours...',
    noData: 'Aucune donnée disponible',
    error: 'Une erreur s\'est produite',
    success: 'Opération réussie',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    noResults: 'Aucun résultat trouvé',
    saved: 'Sauvegardé avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès',
    invited: 'Invitation envoyée avec succès'
  },
  
  // Form Placeholders
  placeholders: {
    searchByName: 'Rechercher par nom...',
    searchByEmail: 'Rechercher par email...',
    searchByNameOrEmail: 'Rechercher par nom ou email...',
    selectRole: 'Sélectionner un rôle',
    selectStatus: 'Sélectionner un statut',
    allRoles: 'Tous les rôles',
    allStatuses: 'Tous les statuts'
  },
  
  // ✅ FERDI SPECIFIC - Terminologie Autocaristes
  ferdi: {
    brand: {
      name: 'FERDI',
      tagline: 'Gestion de flotte d\'autocars pour autocaristes français',
      description: 'Plateforme moderne pour la gestion complète de votre flotte d\'autocars'
    },
    
    // Métier Transport
    transport: {
      fleet: 'Flotte d\'autocars',
      drivers: 'Chauffeurs',
      vehicles: 'Véhicules',
      routes: 'Circuits',
      planning: 'Planification',
      maintenance: 'Maintenance',
      insurance: 'Assurances',
      regulations: 'Réglementation transport'
    }
  },
  
  // Headers & Titles par Page
  headers: {
    users: {
      title: 'Gestion de l\'équipe autocariste',
      subtitle: 'Gérez votre équipe de chauffeurs, dispatchers et personnel administratif',
      tableTitle: 'Membres de l\'équipe',
      createButton: 'Ajouter un membre',
      inviteButton: 'Inviter un nouveau membre'
    },
    
    invitations: {
      title: 'Invitations d\'équipe',
      subtitle: 'Invitez de nouveaux membres à rejoindre votre équipe d\'autocaristes',
      tableTitle: 'Invitations en cours',
      createButton: 'Nouvelle invitation',
      expiry: 'Les invitations expirent automatiquement après 7 jours'
    },
    
    dashboard: {
      welcome: (name) => `Bienvenue${name ? `, ${name}` : ''}`,
      subtitle: (role, company) => `${role}${company ? ` • ${company}` : ''}`,
      overview: 'Vue d\'ensemble de votre activité'
    },
    
    settings: {
      title: 'Paramètres système',
      subtitle: 'Configurez vos préférences et paramètres FERDI',
      notifications: 'Notifications',
      interface: 'Interface utilisateur',
      security: 'Sécurité et authentification',
      system: 'Paramètres système'
    }
  },
  
  // Stats Labels
  stats: {
    total: 'Total',
    active: 'Actifs',
    inactive: 'Inactifs',
    pending: 'En attente',
    expired: 'Expirés',
    deleted: 'Supprimés',
    accepted: 'Acceptées',
    cancelled: 'Annulées',
    locked: 'Bloqués'
  },
  
  // Filters & Search
  filters: {
    title: 'Recherche et filtres',
    results: (count) => `${count} résultat${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`,
    reset: 'Réinitialiser les filtres',
    noFilters: 'Aucun filtre appliqué'
  },
  
  // Error Messages Specifiques
  errors: {
    loadUsers: 'Erreur lors du chargement des utilisateurs',
    loadInvitations: 'Erreur lors du chargement des invitations',
    createUser: 'Erreur lors de la création de l\'utilisateur',
    updateUser: 'Erreur lors de la modification de l\'utilisateur',
    deleteUser: 'Erreur lors de la suppression de l\'utilisateur',
    sendInvitation: 'Erreur lors de l\'envoi de l\'invitation',
    resendInvitation: 'Erreur lors du renvoi de l\'invitation',
    cancelInvitation: 'Erreur lors de l\'annulation de l\'invitation',
    exportData: 'Erreur lors de l\'export des données',
    saveSettings: 'Erreur lors de la sauvegarde des paramètres'
  },
  
  // Success Messages Specifiques  
  success: {
    userCreated: 'Membre d\'équipe ajouté avec succès',
    userUpdated: 'Informations mises à jour avec succès',
    userDeleted: 'Membre retiré de l\'équipe avec succès',
    invitationSent: 'Invitation d\'équipe envoyée avec succès',
    invitationResent: 'Invitation renvoyée avec succès',
    invitationCancelled: 'Invitation annulée avec succès',
    dataExported: 'Données exportées avec succès',
    settingsSaved: 'Paramètres sauvegardés avec succès'
  },
  
  // Roles Labels (Français)
  roles: {
    SUPER_ADMIN: 'Super Administrateur',
    ADMIN: 'Administrateur',
    DISPATCH: 'Dispatcheur',
    DRIVER: 'Chauffeur',
    INTERNAL_SUPPORT: 'Support Interne',
    ACCOUNTANT: 'Comptable'
  }
}

// Helper function pour accès rapide
export const t = (path) => {
  const keys = path.split('.')
  let result = UI_TEXTS_FR
  
  for (const key of keys) {
    result = result?.[key]
    if (result === undefined) {
      console.warn(`[UI_TEXTS] Missing French text for path: ${path}`)
      return path // Fallback to path itself
    }
  }
  
  return result
}

// Helpers pour patterns communs
export const getText = {
  action: (key) => UI_TEXTS_FR.actions[key] || key,
  status: (key) => UI_TEXTS_FR.status[key] || key,
  message: (key) => UI_TEXTS_FR.messages[key] || key,
  placeholder: (key) => UI_TEXTS_FR.placeholders[key] || key,
  stat: (key) => UI_TEXTS_FR.stats[key] || key,
  role: (key) => UI_TEXTS_FR.roles[key] || key,
  error: (key) => UI_TEXTS_FR.errors[key] || UI_TEXTS_FR.messages.error,
  success: (key) => UI_TEXTS_FR.success[key] || UI_TEXTS_FR.messages.success
}