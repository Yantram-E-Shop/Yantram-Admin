import React from 'react'

export default function ProductsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // <html lang="en" className="dark">
        //     <body
        //         className={cn(
        //             "min-h-screen bg-background font-sans antialiased",
        //             fontSans.variable
        //         )}
        //     >
        //         <Navbar />
        //         {children}
        //     </body>
        // </html>
        <>
            {children}
        </>
    );
}



