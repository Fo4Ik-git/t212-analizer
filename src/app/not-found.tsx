import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4 py-16">
            <div className="text-center max-w-md">
                <div className="mb-8 relative w-64 h-64 mx-auto">
                    <Image
                        src="/not_found.webp"
                        alt="Страница не найдена"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">
                    404 - Страница не найдена
                </h1>

                <p className="text-gray-400 mb-8">
                    Упс! Похоже, вы пытаетесь найти страницу, которая не существует или была перемещена.
                </p>

                {/*<Link href="/" passHref>*/}
                {/*    <Button*/}
                {/*        variant={ButtonVariant.PRIMARY}*/}
                {/*        className="px-6 py-3"*/}
                {/*    >*/}
                {/*        Вернуться на главную*/}
                {/*    </Button>*/}
                {/*</Link>*/}
            </div>
        </div>
    );
}
