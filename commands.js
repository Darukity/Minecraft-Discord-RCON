module.exports = {
    commandsList: [
        {
            name: 'ping',
            description: 'Répond Pong!',
        },
        {
            name: 'players',
            description: 'Affiche la liste des joueurs connectés au serveur minecraft',
        },
        {
            name: 'register',
            description: 'Lie votre compte minecraft à votre compte discord',
            options: [
                {
                    name: 'player',
                    description: 'Votre pseudo minecraft',
                    type: 3,
                    required: true,
                },
            ],
        },
        {
            name: 'unregister',
            description: 'Supprime votre compte minecraft de votre compte discord',
            options: [
                {
                    name: 'player',
                    description: 'Votre pseudo minecraft',
                    type: 3,
                    required: true,
                },
            ],
        },
        // {
        //     name: 'edit',
        //     description: 'Modifie le pseudo minecraft lié à votre compte discord',
        //     options: [
        //         {
        //             name: 'player',
        //             description: 'Votre nouveau pseudo minecraft',
        //             type: 3,
        //             required: true,
        //         },
        //     ],
        // },
        {
            name: 'help',
            description: 'Affiche la liste des commandes',
        },
        {
            name: 'roll',
            description: 'Répond un nombre entre 0 et le nombre spécifié (vide = 10)',
            options: [
                {
                    name: 'int',
                    description: 'chiffre ou nombre',
                    type: 4,
                    required: false,
                },
            ],
        },
        {
            name: 'source',
            description: 'Affiche le lien vers le code source du bot',
        },
    ]
}